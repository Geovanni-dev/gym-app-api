<div align="right">
  <a href="./README.md">🇺🇸 English</a>
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

## 📋 Sobre

Uma API RESTful para gestão de treinos na academia, originalmente desenvolvida como **projeto de portfólio** e posteriormente expandida para atender às minhas próprias necessidades de organização. A API gerencia planos de treino (manuais ou gerados por IA), uma biblioteca de exercícios e rastreia recordes pessoais (PR).

Construída com Node.js e Express, conta com validação de schemas via Zod, autenticação JWT, rate limiting e envio de e-mails transacionais via Brevo. A geração de treinos por IA é feita pelo **Google Gemini**. A qualidade do código é garantida por ESLint, Prettier e EditorConfig. Integrada a um frontend em React — confira em produção: [superfrango.grdev.app.br](https://superfrango.grdev.app.br)

---

## 🛠 Tecnologias

| Camada              | Tecnologia                       |
| ------------------- | -------------------------------- |
| Runtime             | Node.js (JavaScript)             |
| Framework           | Express.js                       |
| Banco de dados      | MongoDB + Mongoose               |
| Autenticação        | JSON Web Token (JWT)             |
| Validação           | Zod                              |
| IA                  | Google Gemini (`@google/genai`)  |
| E-mail              | Brevo API (via Axios)            |
| Upload de imagens   | Cloudinary                       |
| Segurança           | Express Rate Limit + bcrypt      |
| Containerização     | Docker + Docker Compose          |
| CI/CD               | GitHub Actions                   |
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
│   │   └── cloudinary.js         # Configuração do SDK do Cloudinary
│   ├── exercises/
│   │   ├── controllers/          # Handlers das rotas /exercises
│   │   └── routes/               # Definição das rotas /exercises
│   ├── history/
│   │   ├── controllers/          # Registro de sessões, histórico e PRs
│   │   └── routes/               # Definição das rotas /workouts
│   ├── middleware/
│   │   ├── authMiddleware.js     # Middleware de verificação JWT
│   │   ├── middleware.js         # Autenticação por API key (rotas de escrita do catálogo)
│   │   └── rateLimit.js          # Regras de rate limiting (global, login, IA)
│   ├── models/
│   │   ├── Exercise.js           # Model Mongoose: biblioteca de exercícios
│   │   ├── User.js               # Model Mongoose: contas de usuário
│   │   ├── WorkoutHistory.js     # Model Mongoose: sessões registradas e PRs
│   │   └── WorkoutPlan.js        # Model Mongoose: planos de treino (manuais e por IA)
│   ├── services/
│   │   └── emailService.js       # Lógica de envio de e-mails via Brevo
│   ├── users/
│   │   ├── controllers/          # Handlers das rotas /users
│   │   └── routes/               # Definição das rotas /users
│   └── workoutPlans/
│       ├── controllers/          # CRUD de planos + geração por IA
│       ├── prompts/
│       │   └── prompt.js         # Template do prompt enviado ao Gemini
│       └── routes/               # Definição das rotas /workout-plans
├── .dockerignore                 # Arquivos ignorados no build do Docker
├── .editorconfig                 # Regras de formatação para editores (indent, charset, EOL)
├── .env.example                  # Template de referência das variáveis de ambiente
├── eslint.config.js              # Configuração flat do ESLint
├── .gitignore
├── .prettierrc                   # Preferências de formatação do Prettier
├── app.js                        # Configuração do app Express e middlewares
├── docker-compose.yml            # Orquestração de múltiplos containers
├── Dockerfile                    # Instruções de build da imagem de produção
├── package.json
└── server.js                     # Ponto de entrada da aplicação (conexão com o banco + listen)
```

---

## ✨ Funcionalidades e Segurança

- **Planos de treino** — criação de planos com múltiplos dias, reordenação de dias e exercícios, renomeação e compartilhamento por código
- **Geração assistida por IA** — o Google Gemini monta um plano completo (dias, exercícios, séries/reps) a partir do objetivo, dias disponíveis na semana e gênero; o plano é devolvido ao cliente para revisão e só é salvo quando o usuário confirma
- **Biblioteca de exercícios** — catálogo compartilhado por grupo muscular, usado tanto na criação manual quanto como fonte obrigatória para a IA escolher os exercícios
- **Rastreamento de PR e histórico** — registro de sessões, consulta de recordes pessoais por exercício (comparação exata, ignorando acento e maiúscula) e navegação pelo histórico completo ou por exercício
- **Verificação de e-mail** — ativação de conta e recuperação de senha via Brevo
- **Upload de imagens** — fotos de perfil armazenadas no Cloudinary
- **Autenticação JWT** — auth stateless por token em todas as rotas protegidas
- **Autenticação por API key** — comparação resistente a timing attack protegendo as rotas de escrita do catálogo de exercícios
- **Rate limiting** — limite global em todas as rotas, limite mais restrito nas rotas de autenticação e limite por usuário na geração por IA
- **Validação de schemas** — todos os payloads validados com Zod antes de chegar aos controllers
- **Qualidade de código** — formatação consistente garantida por ESLint + Prettier + EditorConfig em toda a base de código

---

## 📡 Endpoints da API

> 🔒 Rotas com este ícone exigem o header: `Authorization: Bearer <token_jwt>`
> 🔑 Rotas com este ícone exigem o header: `x-api-key: <sua_api_key>`

Todos os corpos de requisição e resposta usam JSON, exceto quando indicado. A API também oferece dois endpoints públicos de serviço:

| Rota      | Método | Descrição                                                   |
| --------- | ------ | ----------------------------------------------------------- |
| `/`       | GET    | Confirma que a API está em execução                         |
| `/health` | GET    | Health check com `status` e timestamp Unix em milissegundos |

### Autenticação e Usuários — `/users`

| Rota                    | Método | Auth | Payload                              | Descrição                           |
| ----------------------- | ------ | ---- | ------------------------------------ | ----------------------------------- |
| `/register`             | POST   | ❌   | `{"name","email","password"}`        | Cria nova conta                     |
| `/verify-email`         | POST   | ❌   | `{"email","code"}`                   | Valida o e-mail                     |
| `/login`                | POST   | ❌   | `{"email","password"}`               | Retorna o Token JWT                 |
| `/forgot-password`      | POST   | ❌   | `{"email"}`                          | Envia código de recuperação         |
| `/reset-password`       | POST   | ❌   | `{"code","email","password"}`        | Define nova senha                   |
| `/update-password`      | POST   | 🔒   | `{"oldPassword","newPassword"}`      | Troca a senha logado                |
| `/upload-profile-image` | POST   | 🔒   | `multipart/form-data` (`profileImg`) | Envia foto de perfil pro Cloudinary |

### Planos de Treino — `/workout-plans`

| Rota                                             | Método | Auth | Payload                               | Descrição                                                                                                               |
| ------------------------------------------------ | ------ | ---- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/`                                              | POST   | 🔒   | `{"name","days":[...]}`               | Cria um plano manualmente                                                                                               |
| `/`                                              | GET    | 🔒   | —                                     | Lista todos os planos do usuário                                                                                        |
| `/:planId`                                       | DELETE | 🔒   | —                                     | Exclui um plano                                                                                                         |
| `/:planId/name`                                  | PUT    | 🔒   | `{"name"}`                            | Altera o nome do plano                                                                                                  |
| `/:planId/reorder`                               | PUT    | 🔒   | `{"daysOrder":[...]}`                 | Reordena os dias                                                                                                        |
| `/:planId/days`                                  | POST   | 🔒   | `{"name","exercises":[]}`             | Adiciona um dia                                                                                                         |
| `/:planId/days/:dayName`                         | PUT    | 🔒   | `{"name"}`                            | Renomeia um dia                                                                                                         |
| `/:planId/days/:dayName`                         | DELETE | 🔒   | —                                     | Remove um dia                                                                                                           |
| `/:planId/days/:dayName/reorder`                 | PUT    | 🔒   | `{"dayName","exercisesOrder":[...]}`  | Reordena os exercícios de um dia pelos IDs                                                                              |
| `/:planId/days/:dayName/exercises`               | POST   | 🔒   | `{"dayName","exerciseId","sets","reps","weight"}` | Adiciona um exercício da biblioteca a um dia                                                                 |
| `/:planId/days/:dayName/exercises/:exerciseName` | PUT    | 🔒   | `{"sets"?,"reps"?,"weight"?}` | Edita os parâmetros de treino do exercício                                                                                     |
| `/:planId/days/:dayName/exercises/:exerciseName` | DELETE | 🔒   | —                                     | Remove um exercício                                                                                                     |
| `/copy/:shareCode`                               | POST   | 🔒   | —                                     | Copia um plano compartilhado para a própria conta                                                                       |
| `/generate`                                      | POST   | 🔒   | `{"dias","foco","genero"}`            | Gera um plano por IA (veja abaixo) — **não é persistido**, devolve `{"plan"}` pro cliente revisar e salvar via `POST /` |

`/generate` é limitado a **3 requisições por minuto por usuário**. `dias` aceita de 3 a 6, `foco` é um de `hipertrofia`/`força`/`resistência`, `genero` é `masculino`/`feminino`.

> Para adicionar um exercício é necessário enviar um `exerciseId` válido do catálogo. A API resolve o nome e o grupo muscular oficiais, rejeita duplicatas no mesmo dia e mantém compatibilidade com planos antigos sem ID. Novos planos também são validados contra o catálogo antes de serem salvos.

### Treinos (histórico e PRs) — `/workouts`

| Rota                     | Método | Auth | Payload                 | Descrição                                          |
| ------------------------ | ------ | ---- | ----------------------- | -------------------------------------------------- |
| `/log`                   | POST   | 🔒   | `{"exercises":[...]}`   | Registra uma sessão de treino concluída            |
| `/pr`                    | GET    | 🔒   | —                       | Recorde pessoal de um exercício (`?exercise=`)     |
| `/history`               | GET    | 🔒   | —                       | Últimas 20 sessões registradas                     |
| `/history/:exerciseName` | GET    | 🔒   | —                       | Histórico completo de um exercício                 |
| `/history`               | DELETE | 🔒   | `{"confirm":"CONFIRM"}` | Exclui permanentemente todo o histórico do usuário |

### Exercícios — `/exercises`

| Rota    | Método | Auth | Payload                    | Descrição                               |
| ------- | ------ | ---- | -------------------------- | --------------------------------------- |
| `/`     | GET    | 🔒   | —                          | Lista o catálogo completo de exercícios |
| `/`     | POST   | 🔑   | `{"name","muscle"}`        | Cadastra um exercício                   |
| `/bulk` | POST   | 🔑   | `[{"name","muscle"}, ...]` | Cadastra vários exercícios de uma vez   |
| `/:id`  | DELETE | 🔑   | —                          | Remove um exercício                     |

---

## 🔧 Variáveis de Ambiente

| Variável                | Obrigatória | Finalidade                                                    |
| ----------------------- | ----------- | ------------------------------------------------------------- |
| `PORT`                  | Sim         | Porta HTTP usada pelo servidor                                |
| `DATABASE_URL`          | Sim         | String de conexão com o MongoDB                               |
| `JWT_SECRET`            | Sim         | Segredo usado para assinar e validar JWTs                     |
| `CLIENT_URL`            | Sim         | Origem permitida pelo CORS; aceita URLs separadas por vírgula |
| `API_KEY`               | Sim¹        | Protege operações de escrita no catálogo de exercícios       |
| `API_AI_KEY`            | Sim²        | Chave do Google Gemini usada para gerar planos                |
| `BREVO_API_KEY`         | Sim³        | Chave da API Brevo para emails de verificação e recuperação   |
| `BREVO_EMAIL`           | Sim³        | Endereço remetente verificado no Brevo                        |
| `CLOUDINARY_CLOUD_NAME` | Sim⁴        | Identificador da conta Cloudinary                             |
| `CLOUDINARY_API_KEY`    | Sim⁴        | Chave da API Cloudinary                                       |
| `CLOUDINARY_API_SECRET` | Sim⁴        | Segredo da API Cloudinary                                     |
| `NODE_ENV`              | Não         | Use `production` para suprimir logs da aplicação no console   |

¹ Exigida para escritas no catálogo. ² Exigida para geração por IA. ³ Exigidas nos fluxos de email. ⁴ Exigidas no upload de imagem de perfil.

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

| Secret               | Descrição                     |
| -------------------- | ----------------------------- |
| `DOCKERHUB_USERNAME` | Usuário no Docker Hub         |
| `DOCKERHUB_TOKEN`    | Token de acesso do Docker Hub |
| `SSH_HOST`           | IP público da VPS             |
| `SSH_USER`           | Usuário SSH da VPS            |
| `SSH_KEY`            | Chave privada SSH completa    |

Cadastre em **Settings → Secrets and variables → Actions**.

---

## 🚀 Rodando Localmente

### Pré-requisitos

- Node.js 22+ (a imagem Docker usa Node.js 22 Alpine)
- MongoDB local ou uma connection string (ex: MongoDB Atlas)
- Contas no Brevo, Cloudinary e Google AI Studio (Gemini) — opcional para cobertura completa de funcionalidades

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/Geovanni-dev/gym-app-api.git
cd gym-app-api

# 2. Instale as dependências
npm install

# 3. Crie seu arquivo .env a partir do template
cp .env.example .env
# Adicione CLIENT_URL, API_KEY e API_AI_KEY ao arquivo copiado;
# o template atual ainda não inclui essas variáveis.

# 4. Inicie o servidor em modo desenvolvimento
npm run dev
```

Após iniciar, acesse `http://localhost:3000/health` para confirmar que a camada HTTP da API está disponível, independentemente da conexão com o banco.

### Scripts disponíveis

| Comando            | Finalidade                                      |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Inicia a API com Nodemon                        |
| `npm test`         | Executa a suíte de testes com Jest              |
| `npm run lint`     | Verifica o código com ESLint                    |
| `npm run lint:fix` | Corrige automaticamente problemas suportados   |
| `npm run format`   | Formata o código com Prettier                   |

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
