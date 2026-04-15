// Importa o Express para criação das rotas da API
const express = require("express");
const router = express.Router();

const multer = require("multer"); // Biblioteca para lidar com uploads de arquivos
const path = require("path"); // Biblioteca para trabalhar com caminhos de arquivos

// Configura o multer para lidar com uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
    // Gera um nome único mantendo a extensão original
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage }); // Configura o  multer


// Cria uma instância de router do Express
const authMiddleware = require("../../middleware/authMiddleware"); // Middleware de autenticação
// Controller responsável por toda a lógica relacionada aos usuários
const userController = require("../controllers/userController");



// ROTAS DE USUÁRIOS

//registrar um novo usuario
router.post("/register", userController.registerUser);

// Login de usuario
router.post("/login", userController.loginUser);

// recebe o código enviado por email e confirma a conta
router.post("/verify-email", userController.verifyEmail);

// envia um email com codigo para redefinir a senha, sem middleware pois deve funcionar caso n esteja logado
router.post("/forgot-password", userController.forgotPassword);

// Redefinição de senha usando o código recebido por email, tambem sem middleware
router.post("/reset-password", userController.resetPassword);

// Atualização de senha logado usando senha atual/senha nova
router.post("/update-password", authMiddleware, userController.updatePassword);

// rota para upload de imagem de perfil
router.post("/upload-profile-image", authMiddleware, upload.single("profileImg"), userController.addToImg);

// Exporta o router para ser utilizado no servidor principal
module.exports = router;
