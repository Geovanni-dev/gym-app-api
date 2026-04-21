<h1 align="center"> Gym API</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zod-3E6B9E?style=for-the-badge&logo=zod&logoColor=white"/>
</p>

## 📋 Sobre

API para gestão de rotinas de academia, permitindo a geração de treinos automáticos, controle de biblioteca de exercícios e acompanhamento de evolução de carga (PR). O projeto conta com validação de dados utilizando **Zod**, garantindo maior segurança e integridade das informações recebidas pela API. Recentemente a API foi integrada a um frontend desenvolvido em React, disponível no repositório: [Super Frango App Frontend](https://github.com/Geovanni-dev/gym-app-front).

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

> ⚠️ *Nota: Todos os endpoints de `/workouts` e `/workouts-plan` exigem o Header:*  
> `Authorization: Bearer <seu_token_jwt>`

---

## 📡 Guia de Endpoints & Payloads

### 🔐 Autenticação e Usuário (`/users`)

| Rota | Método | Payload (Body) | Descrição |
|------|--------|----------------|-----------|
| `/register` | POST | `{"name": "Geo", "email": "a@a.com", "password": "123"}` | Cria nova conta |
| `/verify-email` | POST | `{"email": "a@a.com", "code": "123456"}` | Valida o e-mail |
| `/login` | POST | `{"email": "a@a.com", "password": "123"}` | Retorna o Token JWT |
| `/forgot-password` | POST | `{"email": "a@a.com"}` | Envia código de recuperação |
| `/reset-password` | POST | `{"code": "123456", "email": "a@a.com", "password": "nova_senha"}` | Define nova senha |

---
### 📋 Gestão de Planos de Treino (`/workout-plans`)

| Rota | Método | Payload (Body) | Descrição |
|------|--------|----------------|-----------|
| `/` | POST | `{"name": "Meu Treino", "days": [{"name": "Segunda", "exercises": [{"name": "Supino", "sets": 4, "reps": "10", "weight": 60}]}]}` | Cria um novo plano de treino |
| `/` | GET | Nenhum | Lista todos os planos do usuário |
| `/:planId` | DELETE | Nenhum | Exclui um plano de treino |
| `/:planId/name` | PUT | `{"name": "Novo Nome"}` | Altera o nome do plano |
| `/:planId/reorder` | PUT | `{"daysOrder": ["Segunda", "Terça", "Quarta"]}` | Reordena os dias do plano |
| `/:planId/day` | POST | `{"name": "Quinta", "exercises": []}` | Adiciona um novo dia ao plano |
| `/:planId/day/:dayName` | DELETE | Nenhum | Remove um dia do plano |
| `/:planId/day/:dayName` | PUT | `{"name": "Novo Nome do Dia"}` | Renomeia um dia existente |

### 🏋️ Gestão de Exercícios nos Planos

| Rota | Método | Payload (Body) | Descrição |
|------|--------|----------------|-----------|
| `/:planId/exercise` | POST | `{"dayName": "Segunda", "name": "Leg Press", "sets": 4, "reps": "12", "weight": 80}` | Adiciona exercício a um dia |
| `/:planId/:day/:exerciseName` | PUT | `{"name": "Novo Nome", "sets": 5, "reps": "8", "weight": 100}` | Edita um exercício existente |
| `/:planId/:day/:exerciseName` | DELETE | Nenhum | Remove um exercício do dia |
| `/:planId/:day/:exerciseName/weight` | PUT | `{"weight": 90}` | Atualiza apenas o peso do exercício |

### 🔗 Compartilhamento de Planos

| Rota | Método | Descrição |
|------|--------|-----------|
| `/copy/:shareCode` | POST | Copia um plano público para o usuário logado usando o código de compartilhamento (ex: `XXXX-XXXX-XXXX`) |



### 🏋️ Gestão de Treinos (`/workouts`)

#### 1. Gerar Treino Automático
**`POST /workouts/generate`**
```json
{
  "goal": "hipertrofia",
  "days": 4
}
```

#### 2. Registrar Execução (Histórico)
**`POST /workouts/log`**
```json
{
  "exercises": [
    {
      "name": "Supino Reto",
      "sets": [
        { "reps": 12, "weight": 60 },
        { "reps": 10, "weight": 70 }
      ]
    }
  ]
}
```

#### 3. Consultas de Histórico e PR
- **Histórico Completo:** `GET /workouts/history`
- **Histórico por Exercício:** `GET /workouts/history/Supino`
- **Recorde Pessoal (PR):** `GET /workouts/pr?exercise=Supino`
- **Meus Planos:** `GET /workouts/my-workouts`

---

### 📚 Biblioteca de Exercícios (`/exercises`)

| Rota | Método | Payload (Body) | Descrição |
|------|--------|----------------|-----------|
| `/` | POST | `{"name": "Leg Press", "muscle": "Pernas"}` | Cadastra exercício base |
| `/` | GET | Nenhum | Lista todos os exercícios |

---

## 🛠 Tecnologias

- **Node.js & Express:** Ambiente de execução e framework web.
- **MongoDB & Mongoose:** Banco de dados NoSQL e modelagem de dados.
- **Bcrypt.js:** Hash de senhas para segurança.
- **JSON Web Token (JWT):** Autenticação baseada em tokens.
- **Nodemailer:** Disparo de e-mails para verificação e recuperação.
- **Cloudinary:** Upload e armazenamento de imagens de perfil.
- **Zod:** Validação de schemas e tipagem estática para garantir a integridade dos dados recebidos pela API.
---

## 🌐 Deploy no Render

O projeto está hospedado no **Render** (plataforma cloud gratuita).

### ☁️ Por que escolhi o Render?

- ✅ Deploy gratuito e simples
- ✅ Integração direta com GitHub
- ✅ Suporte nativo a Node.js
- ✅ SSL automático (HTTPS)

## 📄 Licença

**MIT © Geovani Rodrigues**