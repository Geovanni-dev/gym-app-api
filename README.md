<h1 align="center">🏋️ Gym API</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zod-3E6B9E?style=for-the-badge&logo=zod&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>
  <img src="https://img.shields.io/badge/Nodemailer-22B573?style=for-the-badge&logo=gmail&logoColor=white"/>
</p>

## 📋 Sobre

API para gestão de rotinas de academia, permitindo a geração de treinos automáticos, controle de biblioteca de exercícios e acompanhamento de evolução de carga (PR). O projeto conta com validação de dados via **Zod**, autenticação via **JWT**, proteção contra spam com **Rate Limit** e envio de e-mails com **Nodemailer**. Recentemente integrada a um frontend em React, disponível em: [gym-app-rontend](https://github.com/Geovanni-dev/gym-app-front).

---

## 🚀 Instalação e Execução

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
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

# 4. Inicie o servidor
npm start
```

> ⚠️ *Rotas marcadas com 🔒 exigem o Header:*
> `Authorization: Bearer <seu_token_jwt>`

---

## 🗂️ Arquitetura do Projeto

```
gym-app-api/
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
├── .env
├── server.js
└── package.json
```

---

## 📡 Guia de Endpoints & Payloads

### 🔐 Autenticação e Usuário (`/users`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/register` | POST | ❌ | `{"name": "Geo", "email": "a@a.com", "password": "123"}` | Cria nova conta |
| `/verify-email` | POST | ❌ | `{"email": "a@a.com", "code": "123456"}` | Valida o e-mail |
| `/login` | POST | ❌ | `{"email": "a@a.com", "password": "123"}` | Retorna o Token JWT |
| `/forgot-password` | POST | ❌ | `{"email": "a@a.com"}` | Envia código de recuperação |
| `/reset-password` | POST | ❌ | `{"code": "123456", "email": "a@a.com", "password": "nova_senha"}` | Define nova senha |

---

### 📋 Planos de Treino (`/workout-plans`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/` | POST | 🔒 | `{"name": "Meu Treino", "days": [{"name": "Segunda", "exercises": [{"name": "Supino", "sets": 4, "reps": "10", "weight": 60}]}]}` | Cria um novo plano |
| `/` | GET | 🔒 | Nenhum | Lista todos os planos do usuário |
| `/:planId` | DELETE | 🔒 | Nenhum | Exclui um plano |
| `/:planId/name` | PUT | 🔒 | `{"name": "Novo Nome"}` | Altera o nome do plano |
| `/:planId/reorder` | PUT | 🔒 | `{"daysOrder": ["Segunda", "Terça", "Quarta"]}` | Reordena os dias |
| `/:planId/day` | POST | 🔒 | `{"name": "Quinta", "exercises": []}` | Adiciona um dia ao plano |
| `/:planId/day/:dayName` | DELETE | 🔒 | Nenhum | Remove um dia |
| `/:planId/day/:dayName` | PUT | 🔒 | `{"name": "Novo Nome do Dia"}` | Renomeia um dia |

### Exercícios nos Planos

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/:planId/exercise` | POST | 🔒 | `{"dayName": "Segunda", "name": "Leg Press", "sets": 4, "reps": "12", "weight": 80}` | Adiciona exercício a um dia |
| `/:planId/:day/:exerciseName` | PUT | 🔒 | `{"name": "Novo Nome", "sets": 5, "reps": "8", "weight": 100}` | Edita um exercício |
| `/:planId/:day/:exerciseName` | DELETE | 🔒 | Nenhum | Remove um exercício |
| `/:planId/:day/:exerciseName/weight` | PUT | 🔒 | `{"weight": 90}` | Atualiza apenas o peso |

### Compartilhamento

| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/copy/:shareCode` | POST | 🔒 | Copia um plano público usando código (ex: `XXXX-XXXX-XXXX`) |

---

### 🏋️ Treinos (`/workouts`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/generate` | POST | 🔒 | `{"goal": "hipertrofia", "days": 4}` | Gera treino automático |
| `/log` | POST | 🔒 | `{"exercises": [{"name": "Supino", "sets": [{"reps": 12, "weight": 60}]}]}` | Registra execução |
| `/history` | GET | 🔒 | Nenhum | Histórico completo |
| `/history/:exercise` | GET | 🔒 | Nenhum | Histórico por exercício |
| `/pr` | GET | 🔒 | Nenhum | Recorde pessoal (`?exercise=Supino`) |
| `/my-workouts` | GET | 🔒 | Nenhum | Meus planos |

---

### 📚 Exercícios (`/exercises`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/` | POST | ❌ | `{"name": "Leg Press", "muscle": "Pernas"}` | Cadastra exercício |
| `/` | GET | ❌ | Nenhum | Lista todos os exercícios |

---

## 🛠 Tecnologias

- **Node.js & Express** — Ambiente de execução e framework web
- **MongoDB & Mongoose** — Banco de dados NoSQL e modelagem de dados
- **Bcrypt.js** — Hash de senhas para segurança
- **JSON Web Token (JWT)** — Autenticação baseada em tokens
- **Nodemailer** — Disparo de e-mails para verificação e recuperação de senha
- **Cloudinary** — Upload e armazenamento de imagens de perfil
- **Zod** — Validação de schemas e integridade dos dados recebidos pela API
- **Express Rate Limit** — Proteção contra spam e ataques de força bruta

---

## 🌐 Deploy no Render

O projeto está hospedado no **Render** (plataforma cloud gratuita).

- ✅ Deploy gratuito e simples
- ✅ Integração direta com GitHub
- ✅ Suporte nativo a Node.js
- ✅ SSL automático (HTTPS)

---

## 📄 Licença

**MIT © Geovani Rodrigues**
