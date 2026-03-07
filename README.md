<h1 align="center">🏋️ training-api</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
</p>

## 📋 Sobre
API para geração de treinos automáticos e montagem de treinos personalizados.

## 📌 Principais funções

- ✅ Gerar treinos automáticos baseado em objetivo e dias
- ✅ Criar e salvar seus próprios treinos personalizados
- ✅ Registrar execuções com peso e repetições
- ✅ Acompanhar histórico completo
- ✅ Calcular recordes pessoais (PR)
  
## 📡 Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/users/register` | Criar conta |
| POST | `/users/login` | Fazer login |
| POST | `/workouts/generate` | Gerar treino |
| POST | `/workouts/log` | Registrar treino |
| GET | `/workouts/my-workouts` | Ver planos |
| GET | `/workouts/history` | Histórico completo |
| GET | `/workouts/history/:exercise` | Histórico por exercício |
| GET | `/workouts/pr` | Recorde pessoal |

## 📦 Exemplos

```http
# Gerar treino
POST /workouts/generate
{ "goal": "hipertrofia", "days": 4 }

# Registrar treino
POST /workouts/log
{
  "exercises": [
    {
      "name": "Supino",
      "sets": [
        { "reps": 10, "weight": 60 },
        { "reps": 8, "weight": 70 }
      ]
    }
  ]
}

# Ver PR
GET /workouts/pr?exercise=Supino

````
## 🚀 Instalação

```bash
npm install

