<h1 align="center">🏋️ Gym API</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zod-3E6B9E?style=for-the-badge&logo=zod&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white"/>
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white"/>
</p>

## 📋 Sobre

API para gestão de treinos que começou como projeto de portfólio e evoluiu para resolver minha própria necessidade de organização na academia. A aplicação gera treinos automaticamente, gerencia uma biblioteca de exercícios e rastreia a evolução de cargas (PR). A stack conta com validação via Zod, autenticação JWT, proteção com Rate Limit e envio de e-mails pelo Brevo. Recentemente integrada a um frontend em React. Confira o projeto em produção: [superfrango.grdev.app.br](https://superfrango.grdev.app.br)

---

## 🚀 Instalação e Execução

### Execução Local

```bash
# 1. Clone o repositório
git clone https://github.com/Geovanni-dev/gym-app-api.git

# 2. Instale as dependências
npm install

# 3. Configure o arquivo .env
# Crie um arquivo .env na raiz com as seguintes chaves:
PORT=3000
DATABASE_URL=mongodb://127.0.0.1:27017/workout-api
JWT_SECRET=sua_chave_secreta

# Configurações de E-mail (Brevo API)
BREVO_API_KEY=xkeysib-sua_chave_v3
BREVO_EMAIL=seuemail@gmail.com

# Configurações de Upload de Imagens (Cloudinary)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# 4. Inicie o servidor
npm start
```

### 🐳 Execução via Docker

Você pode subir a API rapidamente usando o Docker, garantindo o mesmo ambiente de execução da produção.

```bash
# 1. Certifique-se de que o seu arquivo .env está configurado na raiz do projeto.

# 2. Construa a imagem e inicie o container em segundo plano
docker compose up -d

# Para visualizar os logs em tempo real:
docker compose logs -f

# Para derrubar o container:
docker compose down
```

---

## ⚙️ CI/CD com GitHub Actions

O projeto utiliza **GitHub Actions** para automatizar o processo de build e deploy a cada push na branch `master`.

### Fluxo do pipeline

1. **Build e Push** — a imagem Docker é construída e enviada automaticamente para o Docker Hub
2. **Deploy** — via SSH, o servidor puxa a nova imagem e recria o container na VPS

### Secrets necessários no repositório

| Secret               | Descrição                     |
| -------------------- | ----------------------------- |
| `DOCKERHUB_USERNAME` | Seu usuário no Docker Hub     |
| `DOCKERHUB_TOKEN`    | Token de acesso do Docker Hub |
| `SSH_HOST`           | IP público da VPS             |
| `SSH_USER`           | Usuário SSH da VPS            |
| `SSH_KEY`            | Chave privada SSH completa    |

### Configuração dos secrets

Acesse **Settings → Secrets and variables → Actions** no repositório e cadastre as chaves acima.

---

## 🗂️ Arquitetura do Projeto

```text
gym-app-api/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── configs/
│   │   └── cloudinary.js
│   ├── data/
│   │   └── exercises.js
│   ├── exercises/
│   │   ├── controllers/
│   │   └── routes/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rateLimit.js
│   ├── models/
│   │   ├── Exercise.js
│   │   ├── User.js
│   │   ├── Workout.js
│   │   ├── WorkoutHistory.js
│   │   └── WorkoutPlan.js
│   ├── services/
│   │   └── emailService.js
│   ├── users/
│   │   ├── controllers/
│   │   └── routes/
│   ├── workoutPlans/
│   │   ├── controllers/
│   │   └── routes/
│   └── workouts/
│       ├── controllers/
│       │   ├── workoutController.js
│       │   └── workoutHistoryController.js
│       └── routes/
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── server.js
```

---

## 📡 Guia de Endpoints & Payloads

> ⚠️ _Rotas marcadas com 🔒 exigem o Header:_
> `Authorization: Bearer <seu_token_jwt>`

### 🔐 Autenticação e Usuário (`/users`)

| Rota               | Método | Auth | Payload (Body)                                                     | Descrição                   |
| ------------------ | ------ | ---- | ------------------------------------------------------------------ | --------------------------- |
| `/register`        | POST   | ❌   | `{"name": "Geo", "email": "a@a.com", "password": "123"}`           | Cria nova conta             |
| `/verify-email`    | POST   | ❌   | `{"email": "a@a.com", "code": "123456"}`                           | Valida o e-mail             |
| `/login`           | POST   | ❌   | `{"email": "a@a.com", "password": "123"}`                          | Retorna o Token JWT         |
| `/forgot-password` | POST   | ❌   | `{"email": "a@a.com"}`                                             | Envia código de recuperação |
| `/reset-password`  | POST   | ❌   | `{"code": "123456", "email": "a@a.com", "password": "nova_senha"}` | Define nova senha           |

---

### 📋 Planos de Treino (`/workout-plans`)

| Rota                    | Método | Auth | Payload (Body)                                                                                                                    | Descrição                        |
| ----------------------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `/`                     | POST   | 🔒   | `{"name": "Meu Treino", "days": [{"name": "Segunda", "exercises": [{"name": "Supino", "sets": 4, "reps": "10", "weight": 60}]}]}` | Cria um novo plano               |
| `/`                     | GET    | 🔒   | Nenhum                                                                                                                            | Lista todos os planos do usuário |
| `/:planId`              | DELETE | 🔒   | Nenhum                                                                                                                            | Exclui um plano                  |
| `/:planId/name`         | PUT    | 🔒   | `{"name": "Novo Nome"}`                                                                                                           | Altera o nome do plano           |
| `/:planId/reorder`      | PUT    | 🔒   | `{"daysOrder": ["Segunda", "Terça", "Quarta"]}`                                                                                   | Reordena os dias                 |
| `/:planId/day`          | POST   | 🔒   | `{"name": "Quinta", "exercises": []}`                                                                                             | Adiciona um dia ao plano         |
| `/:planId/day/:dayName` | DELETE | 🔒   | Nenhum                                                                                                                            | Remove um dia                    |
| `/:planId/day/:dayName` | PUT    | 🔒   | `{"name": "Novo Nome do Dia"}`                                                                                                    | Renomeia um dia                  |

### Exercícios nos Planos

| Rota                                 | Método | Auth | Payload (Body)                                                                       | Descrição                   |
| ------------------------------------ | ------ | ---- | ------------------------------------------------------------------------------------ | --------------------------- |
| `/:planId/exercise`                  | POST   | 🔒   | `{"dayName": "Segunda", "name": "Leg Press", "sets": 4, "reps": "12", "weight": 80}` | Adiciona exercício a um dia |
| `/:planId/:day/:exerciseName`        | PUT    | 🔒   | `{"name": "Novo Nome", "sets": 5, "reps": "8", "weight": 100}`                       | Edita um exercício          |
| `/:planId/:day/:exerciseName`        | DELETE | 🔒   | Nenhum                                                                               | Remove um exercício         |
| `/:planId/:day/:exerciseName/weight` | PUT    | 🔒   | `{"weight": 90}`                                                                     | Atualiza apenas o peso      |

### Compartilhamento

| Rota               | Método | Auth | Descrição                                                   |
| ------------------ | ------ | ---- | ----------------------------------------------------------- |
| `/copy/:shareCode` | POST   | 🔒   | Copia um plano público usando código (ex: `XXXX-XXXX-XXXX`) |

---

### 🏋️ Treinos (`/workouts`)

| Rota                 | Método | Auth | Payload (Body)                                                              | Descrição                            |
| -------------------- | ------ | ---- | --------------------------------------------------------------------------- | ------------------------------------ |
| `/generate`          | POST   | 🔒   | `{"goal": "hipertrofia", "days": 4}`                                        | Gera treino automático               |
| `/log`               | POST   | 🔒   | `{"exercises": [{"name": "Supino", "sets": [{"reps": 12, "weight": 60}]}]}` | Registra execução                    |
| `/history`           | GET    | 🔒   | Nenhum                                                                      | Histórico completo                   |
| `/history/:exercise` | GET    | 🔒   | Nenhum                                                                      | Histórico por exercício              |
| `/pr`                | GET    | 🔒   | Nenhum                                                                      | Recorde pessoal (`?exercise=Supino`) |
| `/my-workouts`       | GET    | 🔒   | Nenhum                                                                      | Meus planos                          |

---

### 📚 Exercícios (`/exercises`)

| Rota | Método | Auth | Payload (Body)                              | Descrição                 |
| ---- | ------ | ---- | ------------------------------------------- | ------------------------- |
| `/`  | POST   | ❌   | `{"name": "Leg Press", "muscle": "Pernas"}` | Cadastra exercício        |
| `/`  | GET    | ❌   | Nenhum                                      | Lista todos os exercícios |

---

## 🛠 Tecnologias

- **Node.js & Express** — Ambiente de execução e framework web
- **MongoDB & Mongoose** — Banco de dados NoSQL e modelagem de dados
- **Bcrypt.js** — Hash de senhas para segurança
- **JSON Web Token (JWT)** — Autenticação baseada em tokens
- **Axios & Brevo API** — Disparo de e-mails via API REST para verificação e recuperação de senha
- **Cloudinary** — Upload e armazenamento de imagens de perfil
- **Zod** — Validação de schemas e integridade dos dados recebidos pela API
- **Express Rate Limit** — Proteção contra spam e ataques de força bruta
- **Docker** — Containerização para padronização de ambientes e deploy
- **GitHub Actions** — Pipeline de CI/CD para build e deploy automatizados

---

## 🌐 Deploy

O projeto é hospedado em uma **VPS** com deploy contínuo via **GitHub Actions**. A cada push na branch `master` a imagem é reconstruída, enviada ao Docker Hub e o container é atualizado automaticamente no servidor.

---

## 📄 Licença

**MIT © Geovani Rodrigues**
