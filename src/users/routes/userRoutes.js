// Importa o Express para criação das rotas da API
const express = require("express");

// Cria uma instância de router do Express
const router = express.Router();

// Controller responsável por toda a lógica relacionada aos usuários
const userController = require("../controllers/userController");

// ROTAS DE USUÁRIOS

// Retorna todos os usuários cadastrados no sistema
router.get("/", userController.getUsers);

// recebe o código enviado por email e confirma a conta
router.post("/verify-email", userController.verifyEmail);

// envia um email com link para redefinir a senha
router.post("/forgot-password", userController.forgotPassword);

// Redefinição de senha usando o token recebido por email
router.post("/reset-password/:token", userController.resetPassword);

// Registro de novo usuario no sistema
router.post("/register", userController.registerUser);

// Autenticação do usuário (login)
router.post("/login", userController.loginUser);

// Exporta o router para ser utilizado no servidor principal
module.exports = router;
