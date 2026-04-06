// Importa o Express para criação das rotas da API
const express = require("express");

// Cria uma instância de router do Express
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware"); // Middleware de autenticação

// Controller responsável por toda a lógica relacionada aos usuários
const userController = require("../controllers/userController");

// ROTAS DE USUÁRIOS

// Registro de novo usuario no sistema
router.post("/register", userController.registerUser);

// Autenticação do usuário (login)
router.post("/login", userController.loginUser);

// recebe o código enviado por email e confirma a conta
router.post("/verify-email", userController.verifyEmail);

// envia um email com link para redefinir a senha (publico)
router.post("/forgot-password", userController.forgotPassword);

// Redefinição de senha usando o token recebido por email (publico)
router.post("/reset-password", userController.resetPassword);

// Atualização de senha (privado)
router.post("/update-password", authMiddleware, userController.updatePassword);

// Exporta o router para ser utilizado no servidor principal
module.exports = router;
