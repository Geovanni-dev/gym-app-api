// Importa o Express para criação das rotas da API
const express = require("express");

// Instância do roteador do Express
const router = express.Router();


// Controller responsavel pela lógica dos planos de treino
const workoutPlanController = require("../controllers/workoutPlanController");

// Middleware que verifica se o usuário ta autenticado via JWT
const authMiddleware = require("../../middleware/authMiddleware");


// ==================================rotas relacionadas aos planos de treino

// Editar nome do plano 
router.put("/:planId/name", authMiddleware, workoutPlanController.updateWorkoutPlanName);

// Reordenar dias do plano
router.put("/:planId/reorder", authMiddleware, workoutPlanController.reorderDaysInPlan);

// Reordenar exercicios de um dia do plano
router.put("/:planId/reorder-exercises", authMiddleware, workoutPlanController.reorderExercisesInDay);

// Editar nome do dia
router.put("/:planId/day/:day", authMiddleware, workoutPlanController.updateDayInPlan);

// Editar exercício completo do plano 
router.put("/:planId/:day/:exerciseName", authMiddleware, workoutPlanController.updateExerciseInPlan);

// Adiciona um exercício a um plano específico
router.post("/:planId/exercise", authMiddleware, workoutPlanController.addExerciseToPlan);

// Adicionar dia ao plano 
router.post("/:planId/day", authMiddleware, workoutPlanController.addDayToPlan);

// Deletar dia do plano 
router.delete("/:planId/day/:dayName", authMiddleware, workoutPlanController.deleteDayFromPlan);


// rota para copiar e colar um plano de treino usando o shareCode
router.post("/copy/:shareCode", authMiddleware, workoutPlanController.copyPlan);

// Cria um novo plano de treino para o usuário
router.post("/", authMiddleware, workoutPlanController.createWorkoutPlan);

// Retorna todos os planos do user logado
router.get("/", authMiddleware, workoutPlanController.getWorkoutPlans);

// Deleta um plano de treino pelo ID
router.delete("/:planId", authMiddleware, workoutPlanController.deleteWorkoutPlan);

// Deleta um exercício do plano de treino
router.delete("/:planId/:day/:exerciseName", authMiddleware, workoutPlanController.deleteExercisePlan);

// Exporta o router para uso no servidor principal
module.exports = router;