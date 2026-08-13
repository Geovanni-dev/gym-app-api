const express = require('express');
const router = express.Router();

const workoutHistoryController = require('../controllers/workoutHistoryController');
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/generate', authMiddleware, workoutController.generateWorkout);

router.post('/log', authMiddleware, workoutController.logWorkout);

// O nome do exercício vem por query: /pr?exercise=Supino
router.get('/pr', authMiddleware, workoutController.getPR);

router.get('/my-workouts', authMiddleware, workoutController.getMyWorkouts);

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

router.delete('/:Id', authMiddleware, workoutController.deleteWorkouts);

router.put('/update-pr', authMiddleware, workoutController.updatePR);

module.exports = router;
