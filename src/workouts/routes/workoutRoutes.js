// Importa o Express para criação das rotas da API
const express = require("express");

// Cria uma instância do router do Express
const router = express.Router();

// Controllers responsáveis pela lógica de treinos e histórico
const workoutHistoryController = require("../controllers/workoutHistoryController");
const workoutController = require("../controllers/workoutController");

// Middleware que verifica se o usuário está autenticado via JWT
const authMiddleware = require("../../middleware/authMiddleware");

// ROTAS DE TREINO

// Gera automaticamente um treino baseado no objetivo e numero de dias
router.post("/generate", authMiddleware, workoutController.generateWorkout);

// Registra a execução de um treino realizado pelo usuario
router.post("/log", authMiddleware, workoutController.logWorkout);

// Retorna o PR de um exercício
// o nome do exercício é enviado via query
// Adicionado rota para PR (Movido para cima para evitar conflito)
router.get("/pr", authMiddleware, workoutController.getPR);

// Lista todos os treinos gerados ou registrados pelo user
router.get("/my-workouts", authMiddleware, workoutController.getMyWorkouts);

// Retorna o histórico completo de treinos do usuário
// usar o controller correto para histórico
router.get("/history", authMiddleware, workoutHistoryController.getWorkoutHistory);

// Rota para buscar histórico
router.get("/history-alt", authMiddleware, workoutController.getWorkoutHistory);

// Retorna o histórico de um exercício específico
// O ":" indica que qualquer coisa vinda após /history/ será tratada como uma variável
router.get("/history/:exerciseName", authMiddleware, workoutHistoryController.getExerciseHistory);

// Rota para deletar um treino
router.delete("/:Id", authMiddleware, workoutController.deleteWorkouts);

// Exporta o router para uso no servidor principal
module.exports = router;