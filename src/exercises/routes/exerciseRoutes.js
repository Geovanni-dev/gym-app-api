const { Router } = require('express');
const router = Router();
const { requireApiKey } = require('../../middleware/middleware');
const authMiddleware = require('../../middleware/authMiddleware');
const exerciseController = require('../controllers/exerciseController');

router.post('/bulk', requireApiKey, exerciseController.createMultipleExercises);

router.post('/', requireApiKey, exerciseController.createExercise);

router.get('/', authMiddleware, exerciseController.getExercises);

router.delete('/:id', requireApiKey, exerciseController.deleteExercise);

module.exports = router;
