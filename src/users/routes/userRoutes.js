const express = require('express');
const router = express.Router();

const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
const { loginLimiter } = require('../../middleware/rateLimit');

const authMiddleware = require('../../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.post('/register', loginLimiter, userController.registerUser);

router.post('/login', loginLimiter, userController.loginUser);

router.post('/verify-email', loginLimiter, userController.verifyEmail);

// Sem authMiddleware: precisa funcionar com o usuário deslogado
router.post('/forgot-password', loginLimiter, userController.forgotPassword);

router.post('/reset-password', loginLimiter, userController.resetPassword);

router.post(
  '/update-password',
  loginLimiter,
  authMiddleware,
  userController.updatePassword,
);

router.post(
  '/upload-profile-image',
  authMiddleware,
  upload.single('profileImg'),
  userController.addToImg,
);

module.exports = router;
