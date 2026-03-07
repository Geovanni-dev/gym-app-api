// Importa o Express para criação das rotas da API
const express = require("express");

// Instância do roteador do Express
const router = express.Router();


// Controller responsavel pela lógica dos planos de treino
const workoutPlanController = require("../controllers/workoutPlanController");

// Middleware que verifica se o usuário ta autenticado via JWT
const authMiddleware = require("../../middleware/authMiddleware");


// ROTAS DE PLANO DE TREINO


// Adiciona um exercício a um plano específico, planId vem pela URL
router.post("/:planId/exercise", authMiddleware, workoutPlanController.addExerciseToPlan);


/* Atualiza o peso de um exercício dentro do plano,
  recebe o plano, o dia e o nome do exercício pela rota*/
router.put("/:planId/:day/:exerciseName", authMiddleware, workoutPlanController.updateExerciseWeight);


// Cria um novo plano de treino para o usuário
router.post("/", authMiddleware, workoutPlanController.createWorkoutPlan);


// Retorna todos os planos do user logado
router.get("/", authMiddleware, workoutPlanController.getWorkoutPlans);


// Exporta o router para ser usado no servidor principal
module.exports = router;