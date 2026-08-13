const { Router } = require('express');
const router = Router();

const exerciseController = require('../controllers/exerciseController');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/', authMiddleware, exerciseController.createExercise);

router.get('/', authMiddleware, exerciseController.getExercises);

router.delete('/:id', authMiddleware, exerciseController.deleteExercise);

module.exports = router;
