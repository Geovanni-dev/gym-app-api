// Importa o Express para criação das rotas da API
const express = require("express");
const router = express.Router();

const multer = require("multer"); // Biblioteca para lidar com uploads de arquivos

const upload = multer({ storage: multer.memoryStorage() }); // Configura o armazenamento de arquivos na memória
const { loginLimiter } = require("../../middleware/rateLimit"); // para limmitar solicitaçoes de loguin, register, etc  

// Cria uma instância de router do Express
const authMiddleware = require("../../middleware/authMiddleware"); // Middleware de autenticação
// Controller responsável por toda a lógica relacionada aos usuários
const userController = require("../controllers/userController");


//==============================ROTAS DE USUÁRIOS


//registrar um novo usuario
router.post("/register",loginLimiter, userController.registerUser);

// Login de usuario
router.post("/login",loginLimiter, userController.loginUser);

// recebe o código enviado por email e confirma a conta
router.post("/verify-email", loginLimiter, userController.verifyEmail);

// envia um email com codigo para redefinir a senha, sem middleware pois deve funcionar caso n esteja logado
router.post("/forgot-password",loginLimiter, userController.forgotPassword);

// Redefinição de senha usando o código recebido por email, tambem sem middleware
router.post("/reset-password", loginLimiter, userController.resetPassword);

// Atualização de senha logado usando senha atual/senha nova
router.post("/update-password",loginLimiter, authMiddleware, userController.updatePassword);

// rota para upload de imagem de perfil
router.post("/upload-profile-image", authMiddleware, upload.single("profileImg"), userController.addToImg);

// Exporta o router para ser utilizado no servidor principal
module.exports = router;
