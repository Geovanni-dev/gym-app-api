const express = require('express');
const router = express.Router();

const workoutHistoryController = require('../controllers/workoutHistoryController');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/log', authMiddleware, workoutHistoryController.logWorkout);

// O nome do exercício vem por query: /pr?exercise=Supino
router.get('/pr', authMiddleware, workoutHistoryController.getPR);

router.get(
  '/history',
  authMiddleware,
  workoutHistoryController.getWorkoutHistory,
);

router.get(
  '/history/:exerciseName',
  authMiddleware,
  workoutHistoryController.getExerciseHistory,
);

router.delete(
  '/history',
  authMiddleware,
  workoutHistoryController.deleteWorkoutHistory,
);

module.exports = router;
