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



// Retorna o histórico completo de treinos do usuário
// CORREÇÃO: Agora usa o controller correto (getWorkoutHistory do workoutHistoryController)
router.get(
  "/history",
  authMiddleware,
  (req, res, next) => {
    console.log("ROTA /workouts/history FOI CHAMADA");
    next();
  },
  workoutHistoryController.getWorkoutHistory  // CORREÇÃO: estava usando o controller errado?
);


// Retorna o histórico de um exercício específico
router.get("/history/:exerciseName", authMiddleware, workoutHistoryController.getExerciseHistory);


// Lista todos os treinos gerados ou registrados pelo user
router.get("/my-workouts", authMiddleware, workoutController.getMyWorkouts);


/* Retorna o PR de um exercício
  o nome do exercício é enviado via query*/
// CORREÇÃO: Adicionado rota para PR
router.get("/pr", authMiddleware, workoutController.getPR);


// CORREÇÃO: Rota para buscar histórico (caso queira usar o getWorkoutHistory do workoutController também)
router.get("/history-alt", authMiddleware, workoutController.getWorkoutHistory);


// Exporta o router para uso no servidor principal
module.exports = router;