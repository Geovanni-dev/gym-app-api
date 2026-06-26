// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa bibliotecas principais da aplicação
const express = require('express');
const cors = require('cors');

const { globalLimiter } = require('./src/middleware/rateLimit'); // importa o globalLimiter para usar no server

// Cria a aplicação Express
const app = express();

// Configura o middleware para lidar com o proxy necessário para o Render
app.set('trust proxy', 1);

// Configura os middlewares
app.use(express.json());

/*app.use(cors());*/

app.use(
  cors({
    origin: process.env.CLIENT_URL.split(',').map((url) => url.trim()),
  }),
);

app.use(globalLimiter);

// Importação das rotas das APIs
const userRoutes = require('./src/users/routes/userRoutes');
const workoutRoutes = require('./src/workouts/routes/workoutsRoutes');
const exerciseRoutes = require('./src/exercises/routes/exerciseRoutes');
const workoutPlanRoutes = require('./src/workoutPlans/routes/workoutPlanRoutes');

//============================= REGISTRO DAS ROTAS

// Rotas relacionadas aos planos de treino
app.use('/workout-plans', workoutPlanRoutes);

// Rotas de exercícios personalizados
app.use('/exercises', exerciseRoutes);

// Rotas de usuários (login, registro, recuperação de senha, up de fts de perfil, etc)
app.use('/users', userRoutes);

// Rotas de treinos e histórico
app.use('/workouts', workoutRoutes);

//==========================debug

// rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor subiu com sucesso',
  });
});

// rota health check para o render/docker
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

module.exports = app;
