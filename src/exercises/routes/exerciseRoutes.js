// Importa o framework responsável por gerenciar as rotas da aplicação
const express = require("express");

// Cria uma instância de roteador do Express
const router = express.Router();


// Controller responsável pela lógica relacionada aos exercícios
const exerciseController = require("../controllers/exerciseController");

// Middleware de autenticação q verifica se o usuário possui um token JWT válido
const authMiddleware  = require("../../middleware/authMiddleware");


// ROTAS DE EXERCÍCIOS

/* Cria um novo exercício e roda o middleware 
primeiro para garantir q o usuário está autenticado */
router.post("/", authMiddleware, exerciseController.createExercise);


/* Retorna todos os exercícios do usuário logado.
 Cada usuário vê apenas os próprios exercícios*/
router.get("/", authMiddleware, exerciseController.getExercises);


/* Deleta um exercício específico pelo ID
 O ID vem pela URL (req.params) */
router.delete("/:id", authMiddleware, exerciseController.deleteExercise);


// Exporta o router para ser usado no servidor principal da API
module.exports = router;