<div align="right">
  <a href="./README.pt.md">🇧🇷 Português</a>
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

## 📋 About

A RESTful API for gym workout management, originally built as a **freelance project** and later extended to cover my own personal training needs. The API handles automatic workout generation, an exercise library, and personal record (PR) tracking.

Built with Node.js and TypeScript, it features schema validation via Zod, JWT authentication, rate limiting, and transactional email via Brevo. Code quality is enforced through ESLint, Prettier, and EditorConfig. Integrated with a React frontend — check it out live: [superfrango.grdev.app.br](https://superfrango.grdev.app.br)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Token (JWT) |
| Validation | Zod |
| Email | Brevo API (via Axios) |
| Image Upload | Cloudinary |
| Security | Express Rate Limit + Bcrypt.js |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Code Quality | ESLint + Prettier + EditorConfig |

---

## 🗂️ Project Structure

```text
gym-app-api/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD pipeline
├── src/
│   ├── configs/
│   │   └── cloudinary.ts         # Cloudinary SDK configuration
│   ├── data/
│   │   └── exercises.ts          # Seed data for the exercise library
│   ├── exercises/
│   │   ├── controllers/          # Request handlers for /exercises routes
│   │   └── routes/               # Route definitions for /exercises
│   ├── middleware/
│   │   ├── authMiddleware.ts     # JWT verification middleware
│   │   └── rateLimit.ts          # Rate limiting rules
│   ├── models/
│   │   ├── Exercise.ts           # Mongoose model: exercise library
│   │   ├── User.ts               # Mongoose model: user accounts
│   │   ├── Workout.ts            # Mongoose model: workout sessions
│   │   ├── WorkoutHistory.ts     # Mongoose model: historical records
│   │   └── WorkoutPlan.ts        # Mongoose model: structured plans
│   ├── services/
│   │   └── emailService.ts       # Brevo email dispatch logic
│   ├── users/
│   │   ├── controllers/          # Request handlers for /users routes
│   │   └── routes/               # Route definitions for /users
│   ├── workoutPlans/
│   │   ├── controllers/          # Request handlers for /workout-plans routes
│   │   └── routes/               # Route definitions for /workout-plans
│   └── workouts/
│       ├── controllers/
│       │   ├── workoutController.ts        # Workout generation & logging
│       │   └── workoutHistoryController.ts # History & PR retrieval
│       └── routes/               # Route definitions for /workouts
├── .dockerignore                 # Files excluded from Docker build context
├── .editorconfig                 # Editor formatting rules (indent, charset, EOL)
├── .env.example                  # Environment variable reference template
├── .eslintrc.json                # ESLint rules and parser config
├── .gitignore
├── .prettierrc                   # Prettier formatting preferences
├── docker-compose.yml            # Multi-container orchestration config
├── Dockerfile                    # Production image build instructions
├── package.json
├── tsconfig.json                 # TypeScript compiler options
└── server.ts                     # Application entry point
```

---

## ✨ Features & Security

- **Automatic workout generation** — AI-assisted plan builder based on goal and available days
- **Exercise library** — create and browse a catalogue of exercises by muscle group
- **Workout plans** — build structured multi-day plans, reorder days, rename, and share via code
- **PR tracking** — log sessions and query personal bests per exercise
- **Email verification** — account activation and password recovery via Brevo
- **Image uploads** — profile pictures stored on Cloudinary
- **JWT authentication** — stateless token-based auth on all protected routes
- **Rate limiting** — guards public endpoints against brute-force and spam
- **Schema validation** — all incoming payloads validated with Zod before hitting controllers
- **Code quality** — consistent formatting enforced by ESLint + Prettier + EditorConfig across the entire codebase

---

## 📡 API Endpoints

> 🔒 Routes marked with this lock require the header: `Authorization: Bearer <jwt_token>`

### Authentication & Users — `/users`

| Route | Method | Auth | Payload | Description |
|---|---|---|---|---|
| `/register` | POST | ❌ | `{"name","email","password"}` | Create a new account |
| `/verify-email` | POST | ❌ | `{"email","code"}` | Verify email address |
| `/login` | POST | ❌ | `{"email","password"}` | Returns a JWT token |
| `/forgot-password` | POST | ❌ | `{"email"}` | Send recovery code |
| `/reset-password` | POST | ❌ | `{"code","email","password"}` | Set a new password |

### Workout Plans — `/workout-plans`

| Route | Method | Auth | Payload | Description |
|---|---|---|---|---|
| `/` | POST | 🔒 | `{"name","days":[...]}` | Create a new plan |
| `/` | GET | 🔒 | — | List all user plans |
| `/:planId` | DELETE | 🔒 | — | Delete a plan |
| `/:planId/name` | PUT | 🔒 | `{"name"}` | Rename a plan |
| `/:planId/reorder` | PUT | 🔒 | `{"daysOrder":[...]}` | Reorder days |
| `/:planId/day` | POST | 🔒 | `{"name","exercises":[]}` | Add a day |
| `/:planId/day/:dayName` | DELETE | 🔒 | — | Remove a day |
| `/:planId/day/:dayName` | PUT | 🔒 | `{"name"}` | Rename a day |
| `/:planId/exercise` | POST | 🔒 | `{"dayName","name","sets","reps","weight"}` | Add exercise to a day |
| `/:planId/:day/:exerciseName` | PUT | 🔒 | `{"name","sets","reps","weight"}` | Edit an exercise |
| `/:planId/:day/:exerciseName` | DELETE | 🔒 | — | Remove an exercise |
| `/:planId/:day/:exerciseName/weight` | PUT | 🔒 | `{"weight"}` | Update only weight |
| `/copy/:shareCode` | POST | 🔒 | — | Copy a shared plan |

### Workouts — `/workouts`

| Route | Method | Auth | Payload | Description |
|---|---|---|---|---|
| `/generate` | POST | 🔒 | `{"goal","days"}` | Auto-generate a workout |
| `/log` | POST | 🔒 | `{"exercises":[...]}` | Log a workout session |
| `/history` | GET | 🔒 | — | Full session history |
| `/history/:exercise` | GET | 🔒 | — | History by exercise |
| `/pr` | GET | 🔒 | — | Personal records (`?exercise=`) |
| `/my-workouts` | GET | 🔒 | — | List own plans |

### Exercises — `/exercises`

| Route | Method | Auth | Payload | Description |
|---|---|---|---|---|
| `/` | POST | ❌ | `{"name","muscle"}` | Register an exercise |
| `/` | GET | ❌ | — | List all exercises |

---

## ⚙️ CI/CD Pipeline

The project uses **GitHub Actions** to automate build and deploy on every push to `master`.

```
Push to master
    │
    ▼
Build Docker image
    │
    ▼
Push to Docker Hub
    │
    ▼
SSH into VPS → pull new image → recreate container
```

### Required repository secrets

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SSH_HOST` | VPS public IP |
| `SSH_USER` | SSH user |
| `SSH_KEY` | Full private SSH key |

Add them under **Settings → Secrets and variables → Actions**.

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- MongoDB running locally or a connection string
- Accounts for Brevo and Cloudinary (optional for full feature coverage)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Geovanni-dev/gym-app-api.git
cd gym-app-api

# 2. Install dependencies
npm install

# 3. Create your .env file from the template
cp .env.example .env
# Fill in the values below:
#   PORT=3000
#   DATABASE_URL=mongodb://127.0.0.1:27017/workout-api
#   JWT_SECRET=your_secret_key
#   BREVO_API_KEY=xkeysib-...
#   BREVO_EMAIL=your@email.com
#   CLOUDINARY_CLOUD_NAME=...
#   CLOUDINARY_API_KEY=...
#   CLOUDINARY_API_SECRET=...

# 4. Start the development server
npm run dev
```

### 🐳 Docker

```bash
# Build and start the container in the background
docker compose up -d

# Stream logs
docker compose logs -f

# Stop and remove the container
docker compose down
```

---

## 🌐 Deployment

Hosted on a **VPS** with fully automated deploys via GitHub Actions. Every push to `master` rebuilds the image, pushes it to Docker Hub, and updates the running container on the server with zero manual steps.

---

## 📄 License

**MIT © Geovani Rodrigues**
