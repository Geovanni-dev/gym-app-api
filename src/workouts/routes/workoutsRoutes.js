// Importa o Express para criação das rotas da API
const express = require('express');

// Cria uma instância do router do Express
const router = express.Router();

// Controllers responsáveis pela lógica de treinos e histórico
const workoutHistoryController = require('../controllers/workoutHistoryController');
const workoutController = require('../controllers/workoutController');

// Middleware que verifica se o usuário está autenticado via JWT
const authMiddleware = require('../../middleware/authMiddleware');

// ROTAS DE TREINO

// Gera automaticamente um treino baseado no objetivo e numero de dias
router.post('/generate', authMiddleware, workoutController.generateWorkout);

// Registra a execução de um treino realizado pelo usuario
router.post('/log', authMiddleware, workoutController.logWorkout);

/* Retorna o PR de um exercício,
O nome do exercício é enviado via query (ex: /pr?exercise=Supino)*/
router.get('/pr', authMiddleware, workoutController.getPR);

// Lista todos os treinos gerados ou registrados pelo user
router.get('/my-workouts', authMiddleware, workoutController.getMyWorkouts);

// Retorna o histórico completo de treinos do usuário

router.get(
  '/history',
  authMiddleware,
  workoutHistoryController.getWorkoutHistory,
);

// Retorna o histórico de um exercício específico
router.get(
  '/history/:exerciseName',
  authMiddleware,
  workoutHistoryController.getExerciseHistory,
);

// Rota para deletar o histórico completo de treinos do usuário (opcional, não implementada ainda)
router.delete(
  '/history',
  authMiddleware,
  workoutHistoryController.deleteWorkoutHistory,
);

// Deleta um treino pelo ID
router.delete('/:Id', authMiddleware, workoutController.deleteWorkouts);

// Rota para editar o PR de um exercício
router.put('/update-pr', authMiddleware, workoutController.updatePR);

// Exporta o router para uso no servidor principal
module.exports = router;
