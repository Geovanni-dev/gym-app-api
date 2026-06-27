<div align="right">
  <a href="./README.md">🇺🇸 English</a>
</div>

<h1 align="center">🏋️ Gym API</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zod-3E6B9E?style=for-the-badge&logo=zod&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black"/>
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white"/>
</p>

---

## 📋 Sobre

Uma API RESTful para gestão de treinos na academia, originalmente desenvolvida como **projeto de portfólio** e posteriormente expandida para atender às minhas próprias necessidades de organização. A API realiza geração automática de treinos, gerencia uma biblioteca de exercícios e rastreia recordes pessoais (PR).

Construída com Node.js e TypeScript, conta com validação de schemas via Zod, autenticação JWT, rate limiting e envio de e-mails transacionais via Brevo. A qualidade do código é garantida por ESLint, Prettier e EditorConfig. Integrada a um frontend em React — confira em produção: [superfrango.grdev.app.br](https://superfrango.grdev.app.br)

---

## 🛠 Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Banco de dados | MongoDB + Mongoose |
| Autenticação | JSON Web Token (JWT) |
| Validação | Zod |
| E-mail | Brevo API (via Axios) |
| Upload de imagens | Cloudinary |
| Segurança | Express Rate Limit + Bcrypt.js |
| Containerização | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Qualidade de código | ESLint + Prettier + EditorConfig |

---

## 🗂️ Estrutura do Projeto

```text
gym-app-api/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Pipeline de CI/CD via GitHub Actions
├── src/
│   ├── configs/
│   │   └── cloudinary.ts         # Configuração do SDK do Cloudinary
│   ├── data/
│   │   └── exercises.ts          # Dados iniciais da biblioteca de exercícios
│   ├── exercises/
│   │   ├── controllers/          # Handlers das rotas /exercises
│   │   └── routes/               # Definição das rotas /exercises
│   ├── middleware/
│   │   ├── authMiddleware.ts     # Middleware de verificação JWT
│   │   └── rateLimit.ts          # Regras de rate limiting
│   ├── models/
│   │   ├── Exercise.ts           # Model Mongoose: biblioteca de exercícios
│   │   ├── User.ts               # Model Mongoose: contas de usuário
│   │   ├── Workout.ts            # Model Mongoose: sessões de treino
│   │   ├── WorkoutHistory.ts     # Model Mongoose: histórico de registros
│   │   └── WorkoutPlan.ts        # Model Mongoose: planos estruturados
│   ├── services/
│   │   └── emailService.ts       # Lógica de envio de e-mails via Brevo
│   ├── users/
│   │   ├── controllers/          # Handlers das rotas /users
│   │   └── routes/               # Definição das rotas /users
│   ├── workoutPlans/
│   │   ├── controllers/          # Handlers das rotas /workout-plans
│   │   └── routes/               # Definição das rotas /workout-plans
│   └── workouts/
│       ├── controllers/
│       │   ├── workoutController.ts        # Geração e registro de treinos
│       │   └── workoutHistoryController.ts # Histórico e consulta de PRs
│       └── routes/               # Definição das rotas /workouts
├── .dockerignore                 # Arquivos ignorados no build do Docker
├── .editorconfig                 # Regras de formatação para editores (indent, charset, EOL)
├── .env.example                  # Template de referência das variáveis de ambiente
├── .eslintrc.json                # Regras e configuração do parser ESLint
├── .gitignore
├── .prettierrc                   # Preferências de formatação do Prettier
├── docker-compose.yml            # Orquestração de múltiplos containers
├── Dockerfile                    # Instruções de build da imagem de produção
├── package.json
├── tsconfig.json                 # Opções do compilador TypeScript
└── server.ts                     # Ponto de entrada da aplicação
```

---

## ✨ Funcionalidades e Segurança

- **Geração automática de treinos** — construção de planos com base em objetivo e dias disponíveis
- **Biblioteca de exercícios** — cadastro e consulta por grupo muscular
- **Planos de treino** — criação de planos com múltiplos dias, reordenação, renomeação e compartilhamento por código
- **Rastreamento de PR** — registro de sessões e consulta de recordes pessoais por exercício
- **Verificação de e-mail** — ativação de conta e recuperação de senha via Brevo
- **Upload de imagens** — fotos de perfil armazenadas no Cloudinary
- **Autenticação JWT** — auth stateless por token em todas as rotas protegidas
- **Rate limiting** — proteção dos endpoints públicos contra força bruta e spam
- **Validação de schemas** — todos os payloads validados com Zod antes de chegar aos controllers
- **Qualidade de código** — formatação consistente garantida por ESLint + Prettier + EditorConfig em toda a base de código

---

## 📡 Endpoints da API

> 🔒 Rotas com este ícone exigem o header: `Authorization: Bearer <token_jwt>`

### Autenticação e Usuários — `/users`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/register` | POST | ❌ | `{"name","email","password"}` | Cria nova conta |
| `/verify-email` | POST | ❌ | `{"email","code"}` | Valida o e-mail |
| `/login` | POST | ❌ | `{"email","password"}` | Retorna o Token JWT |
| `/forgot-password` | POST | ❌ | `{"email"}` | Envia código de recuperação |
| `/reset-password` | POST | ❌ | `{"code","email","password"}` | Define nova senha |

### Planos de Treino — `/workout-plans`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/` | POST | 🔒 | `{"name","days":[...]}` | Cria um novo plano |
| `/` | GET | 🔒 | — | Lista todos os planos do usuário |
| `/:planId` | DELETE | 🔒 | — | Exclui um plano |
| `/:planId/name` | PUT | 🔒 | `{"name"}` | Altera o nome do plano |
| `/:planId/reorder` | PUT | 🔒 | `{"daysOrder":[...]}` | Reordena os dias |
| `/:planId/day` | POST | 🔒 | `{"name","exercises":[]}` | Adiciona um dia ao plano |
| `/:planId/day/:dayName` | DELETE | 🔒 | — | Remove um dia |
| `/:planId/day/:dayName` | PUT | 🔒 | `{"name"}` | Renomeia um dia |
| `/:planId/exercise` | POST | 🔒 | `{"dayName","name","sets","reps","weight"}` | Adiciona exercício a um dia |
| `/:planId/:day/:exerciseName` | PUT | 🔒 | `{"name","sets","reps","weight"}` | Edita um exercício |
| `/:planId/:day/:exerciseName` | DELETE | 🔒 | — | Remove um exercício |
| `/:planId/:day/:exerciseName/weight` | PUT | 🔒 | `{"weight"}` | Atualiza apenas o peso |
| `/copy/:shareCode` | POST | 🔒 | — | Copia um plano compartilhado |

### Treinos — `/workouts`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/generate` | POST | 🔒 | `{"goal","days"}` | Gera treino automático |
| `/log` | POST | 🔒 | `{"exercises":[...]}` | Registra sessão de treino |
| `/history` | GET | 🔒 | — | Histórico completo |
| `/history/:exercise` | GET | 🔒 | — | Histórico por exercício |
| `/pr` | GET | 🔒 | — | Recordes pessoais (`?exercise=`) |
| `/my-workouts` | GET | 🔒 | — | Meus planos |

### Exercícios — `/exercises`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/` | POST | ❌ | `{"name","muscle"}` | Cadastra exercício |
| `/` | GET | ❌ | — | Lista todos os exercícios |

---

## ⚙️ Pipeline de CI/CD

O projeto utiliza **GitHub Actions** para automatizar build e deploy a cada push na branch `master`.

```
Push para master
    │
    ▼
Build da imagem Docker
    │
    ▼
Push para o Docker Hub
    │
    ▼
SSH na VPS → pull da nova imagem → recriação do container
```

### Secrets necessários no repositório

| Secret | Descrição |
|---|---|
| `DOCKERHUB_USERNAME` | Usuário no Docker Hub |
| `DOCKERHUB_TOKEN` | Token de acesso do Docker Hub |
| `SSH_HOST` | IP público da VPS |
| `SSH_USER` | Usuário SSH da VPS |
| `SSH_KEY` | Chave privada SSH completa |

Cadastre em **Settings → Secrets and variables → Actions**.

---

## 🚀 Rodando Localmente

### Pré-requisitos

- Node.js 18+
- MongoDB local ou uma connection string
- Contas no Brevo e Cloudinary (opcional para cobertura completa de funcionalidades)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/Geovanni-dev/gym-app-api.git
cd gym-app-api

# 2. Instale as dependências
npm install

# 3. Crie seu arquivo .env a partir do template
cp .env.example .env
# Preencha as variáveis:
#   PORT=3000
#   DATABASE_URL=mongodb://127.0.0.1:27017/workout-api
#   JWT_SECRET=sua_chave_secreta
#   BREVO_API_KEY=xkeysib-...
#   BREVO_EMAIL=seuemail@gmail.com
#   CLOUDINARY_CLOUD_NAME=...
#   CLOUDINARY_API_KEY=...
#   CLOUDINARY_API_SECRET=...

# 4. Inicie o servidor em modo desenvolvimento
npm run dev
```

### 🐳 Docker

```bash
# Build e inicialização do container em segundo plano
docker compose up -d

# Visualizar logs em tempo real
docker compose logs -f

# Derrubar o container
docker compose down
```

---

## 🌐 Deploy

Hospedado em uma **VPS** com deploys totalmente automatizados via GitHub Actions. A cada push na branch `master`, a imagem é reconstruída, enviada ao Docker Hub e o container é atualizado no servidor sem nenhuma intervenção manual.

---

## 📄 Licença

**MIT © Geovani Rodrigues**
