<div align="right">
  <a href="./README.pt.md">🇧🇷 Português</a>
</div>

<h1 align="center">🏋️ Gym API</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zod-3E6B9E?style=for-the-badge&logo=zod&logoColor=white"/>
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black"/>
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white"/>
</p>

---

## 📋 About

A RESTful API for gym workout management, originally built as a **portfolio project** and later extended to cover my own personal training needs. The API handles workout plans (manual or AI-generated), an exercise library, and personal record (PR) tracking.

Built with Node.js and Express, it features schema validation via Zod, JWT authentication, rate limiting, and transactional email via Brevo. AI-assisted plan generation is powered by **Google Gemini**. Code quality is enforced through ESLint, Prettier, and EditorConfig. Integrated with a React frontend — check it out live: [superfrango.grdev.app.br](https://superfrango.grdev.app.br)

---

## 🛠 Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Runtime          | Node.js (JavaScript)             |
| Framework        | Express.js                       |
| Database         | MongoDB + Mongoose               |
| Authentication   | JSON Web Token (JWT)             |
| Validation       | Zod                              |
| AI               | Google Gemini (`@google/genai`)  |
| Email            | Brevo API (via Axios)            |
| Image Upload     | Cloudinary                       |
| Security         | Express Rate Limit + Bcrypt.js   |
| Containerization | Docker + Docker Compose          |
| CI/CD            | GitHub Actions                   |
| Code Quality     | ESLint + Prettier + EditorConfig |

---

## 🗂️ Project Structure

```text
gym-app-api/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD pipeline
├── src/
│   ├── configs/
│   │   └── cloudinary.js         # Cloudinary SDK configuration
│   ├── exercises/
│   │   ├── controllers/          # Request handlers for /exercises routes
│   │   └── routes/               # Route definitions for /exercises
│   ├── history/
│   │   ├── controllers/          # Session logging, history & PR queries
│   │   └── routes/               # Route definitions for /workouts
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   ├── middleware.js         # API key auth (catalog write routes)
│   │   └── rateLimit.js          # Rate limiting rules (global, login, AI)
│   ├── models/
│   │   ├── Exercise.js           # Mongoose model: exercise library
│   │   ├── User.js               # Mongoose model: user accounts
│   │   ├── WorkoutHistory.js     # Mongoose model: logged sessions & PRs
│   │   └── WorkoutPlan.js        # Mongoose model: workout plans (manual & AI)
│   ├── services/
│   │   └── emailService.js       # Brevo email dispatch logic
│   ├── users/
│   │   ├── controllers/          # Request handlers for /users routes
│   │   └── routes/               # Route definitions for /users
│   └── workoutPlans/
│       ├── controllers/          # CRUD for plans + AI generation
│       ├── prompts/
│       │   └── prompt.js         # Gemini prompt template
│       └── routes/               # Route definitions for /workout-plans
├── .dockerignore                 # Files excluded from Docker build context
├── .editorconfig                 # Editor formatting rules (indent, charset, EOL)
├── .env.example                  # Environment variable reference template
├── eslint.config.js              # ESLint flat config
├── .gitignore
├── .prettierrc                   # Prettier formatting preferences
├── app.js                        # Express app & middleware setup
├── docker-compose.yml            # Multi-container orchestration config
├── Dockerfile                    # Production image build instructions
├── package.json
└── server.js                     # Application entry point (DB connect + listen)
```

---

## ✨ Features & Security

- **Workout plans** — build structured multi-day plans, reorder days and exercises, rename, and share via code
- **AI-assisted generation** — Google Gemini builds a full plan (days, exercises, sets/reps) from goal, weekly days and gender; the plan is returned to the client for review and only saved once the user confirms
- **Exercise library** — a shared catalogue of exercises by muscle group, used both for manual creation and as the source the AI must pick exercises from
- **PR & history tracking** — log sessions, query personal bests per exercise (accent/case-insensitive exact match), and browse full or per-exercise history
- **Email verification** — account activation and password recovery via Brevo
- **Image uploads** — profile pictures stored on Cloudinary
- **JWT authentication** — stateless token-based auth on all protected routes
- **API key authentication** — timing-safe comparison guarding the exercise catalog's write routes
- **Rate limiting** — global cap on all routes, a tighter cap on auth routes, and a per-user cap on AI generation
- **Schema validation** — all incoming payloads validated with Zod before hitting controllers
- **Code quality** — consistent formatting enforced by ESLint + Prettier + EditorConfig across the entire codebase

---

## 📡 API Endpoints

> 🔒 Routes marked with this lock require the header: `Authorization: Bearer <jwt_token>`
> 🔑 Routes marked with this key require the header: `x-api-key: <api_key>`

### Authentication & Users — `/users`

| Route                   | Method | Auth | Payload                              | Description                          |
| ----------------------- | ------ | ---- | ------------------------------------ | ------------------------------------ |
| `/register`             | POST   | ❌   | `{"name","email","password"}`        | Create a new account                 |
| `/verify-email`         | POST   | ❌   | `{"email","code"}`                   | Verify email address                 |
| `/login`                | POST   | ❌   | `{"email","password"}`               | Returns a JWT token                  |
| `/forgot-password`      | POST   | ❌   | `{"email"}`                          | Send recovery code                   |
| `/reset-password`       | POST   | ❌   | `{"code","email","password"}`        | Set a new password                   |
| `/update-password`      | POST   | 🔒   | `{"oldPassword","newPassword"}`      | Change password while logged in      |
| `/upload-profile-image` | POST   | 🔒   | `multipart/form-data` (`profileImg`) | Upload profile picture to Cloudinary |

### Workout Plans — `/workout-plans`

| Route                                            | Method | Auth | Payload                               | Description                                                                                                           |
| ------------------------------------------------ | ------ | ---- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/`                                              | POST   | 🔒   | `{"name","days":[...]}`               | Create a plan manually                                                                                                |
| `/`                                              | GET    | 🔒   | —                                     | List all plans for the user                                                                                           |
| `/:planId`                                       | DELETE | 🔒   | —                                     | Delete a plan                                                                                                         |
| `/:planId/name`                                  | PUT    | 🔒   | `{"name"}`                            | Rename a plan                                                                                                         |
| `/:planId/reorder`                               | PUT    | 🔒   | `{"daysOrder":[...]}`                 | Reorder days                                                                                                          |
| `/:planId/days`                                  | POST   | 🔒   | `{"name","exercises":[]}`             | Add a day                                                                                                             |
| `/:planId/days/:dayName`                         | PUT    | 🔒   | `{"name"}`                            | Rename a day                                                                                                          |
| `/:planId/days/:dayName`                         | DELETE | 🔒   | —                                     | Remove a day                                                                                                          |
| `/:planId/days/:dayName/reorder`                 | PUT    | 🔒   | `{"exercisesOrder":[...]}`            | Reorder exercises within a day                                                                                        |
| `/:planId/days/:dayName/exercises`               | POST   | 🔒   | `{"name","sets","reps","weight"}`     | Add an exercise to a day                                                                                              |
| `/:planId/days/:dayName/exercises/:exerciseName` | PUT    | 🔒   | `{"name"?,"sets"?,"reps"?,"weight"?}` | Edit an exercise (partial update)                                                                                     |
| `/:planId/days/:dayName/exercises/:exerciseName` | DELETE | 🔒   | —                                     | Remove an exercise                                                                                                    |
| `/copy/:shareCode`                               | POST   | 🔒   | —                                     | Copy a shared plan into your own account                                                                              |
| `/generate`                                      | POST   | 🔒   | `{"dias","foco","genero"}`            | AI-generate a plan (see below) — **not persisted**, returns `{"plan"}` for the client to review and save via `POST /` |

`/generate` is limited to **3 requests per minute per user**. `dias` accepts 3–6, `foco` is one of `hipertrofia`/`força`/`resistência`, `genero` is `masculino`/`feminino`.

### Workouts (history & PRs) — `/workouts`

| Route                    | Method | Auth | Payload                 | Description                                    |
| ------------------------ | ------ | ---- | ----------------------- | ---------------------------------------------- |
| `/log`                   | POST   | 🔒   | `{"exercises":[...]}`   | Log a completed workout session                |
| `/pr`                    | GET    | 🔒   | —                       | Personal record for an exercise (`?exercise=`) |
| `/history`               | GET    | 🔒   | —                       | Latest 20 logged sessions                      |
| `/history/:exerciseName` | GET    | 🔒   | —                       | Full history for one exercise                  |
| `/history`               | DELETE | 🔒   | `{"confirm":"CONFIRM"}` | Permanently delete the user's entire history   |

### Exercises — `/exercises`

| Route   | Method | Auth | Payload                    | Description                      |
| ------- | ------ | ---- | -------------------------- | -------------------------------- |
| `/`     | GET    | 🔒   | —                          | List the full exercise catalogue |
| `/`     | POST   | 🔑   | `{"name","muscle"}`        | Register a single exercise       |
| `/bulk` | POST   | 🔑   | `[{"name","muscle"}, ...]` | Bulk-register exercises          |
| `/:id`  | DELETE | 🔑   | —                          | Remove an exercise               |

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

| Secret               | Description             |
| -------------------- | ----------------------- |
| `DOCKERHUB_USERNAME` | Docker Hub username     |
| `DOCKERHUB_TOKEN`    | Docker Hub access token |
| `SSH_HOST`           | VPS public IP           |
| `SSH_USER`           | SSH user                |
| `SSH_KEY`            | Full private SSH key    |

Add them under **Settings → Secrets and variables → Actions**.

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- MongoDB running locally or a connection string (e.g. MongoDB Atlas)
- Accounts for Brevo, Cloudinary and Google AI Studio (Gemini) — optional for full feature coverage

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
#   CLIENT_URL=http://localhost:5173
#   API_KEY=your_own_api_key            # protects the exercise catalog's write routes
#   API_AI_KEY=your_gemini_api_key      # used for AI plan generation
#   BREVO_API_KEY=xkeysib-...
#   BREVO_EMAIL=your@email.com
#   CLOUDINARY_CLOUD_NAME=...
#   CLOUDINARY_API_KEY=...
#   CLOUDINARY_API_SECRET=...

# 4. Start the development server
npm run dev
```

> ⚠️ `CLIENT_URL`, `API_KEY` and `API_AI_KEY` are required by the code but currently missing from `.env.example` — add them there too.

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
