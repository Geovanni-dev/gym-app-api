require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
}

const express = require('express');
const cors = require('cors');

const { globalLimiter } = require('./src/middleware/rateLimit');

const app = express();

// Necessário para o rate limit enxergar o IP real atrás do proxy do Render
app.set('trust proxy', 1);

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL.split(',').map((url) => url.trim()),
  }),
);

app.use(globalLimiter);

const userRoutes = require('./src/users/routes/userRoutes');
const workoutRoutes = require('./src/history/routes/workoutsRoutes');
const exerciseRoutes = require('./src/exercises/routes/exerciseRoutes');
const workoutPlanRoutes = require('./src/workoutPlans/routes/workoutPlanRoutes');

app.use('/workout-plans', workoutPlanRoutes);
app.use('/exercises', exerciseRoutes);
app.use('/users', userRoutes);
app.use('/workouts', workoutRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Servidor subiu com sucesso',
  });
});

// Health check do Render/Docker
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

module.exports = app;
