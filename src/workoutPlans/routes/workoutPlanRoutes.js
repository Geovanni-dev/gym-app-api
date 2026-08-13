const express = require('express');
const router = express.Router();
const { aiLimiter } = require('../../middleware/rateLimit');
const workoutPlanController = require('../controllers/workoutPlanController');
const authMiddleware = require('../../middleware/authMiddleware');

router.put(
  '/:planId/name',
  authMiddleware,
  workoutPlanController.updateWorkoutPlanName,
);

router.put(
  '/:planId/reorder',
  authMiddleware,
  workoutPlanController.reorderDaysInPlan,
);

router.put(
  '/:planId/days/:dayName/reorder',
  authMiddleware,
  workoutPlanController.reorderExercisesInDay,
);

router.put(
  '/:planId/days/:dayName',
  authMiddleware,
  workoutPlanController.updateDayInPlan,
);

router.put(
  '/:planId/days/:dayName/exercises/:exerciseName',
  authMiddleware,
  workoutPlanController.updateExerciseInPlan,
);

router.post(
  '/generate',
  aiLimiter,
  authMiddleware,
  workoutPlanController.generatePlan,
);

router.post(
  '/:planId/days/:dayName/exercises',
  authMiddleware,
  workoutPlanController.addExerciseToPlan,
);

router.post(
  '/:planId/days',
  authMiddleware,
  workoutPlanController.addDayToPlan,
);

router.delete(
  '/:planId/days/:dayName',
  authMiddleware,
  workoutPlanController.deleteDayFromPlan,
);

router.post('/copy/:shareCode', authMiddleware, workoutPlanController.copyPlan);

router.post('/', authMiddleware, workoutPlanController.createWorkoutPlan);

router.get('/', authMiddleware, workoutPlanController.getWorkoutPlans);

router.delete(
  '/:planId',
  authMiddleware,
  workoutPlanController.deleteWorkoutPlan,
);

router.delete(
  '/:planId/days/:dayName/exercises/:exerciseName',
  authMiddleware,
  workoutPlanController.deleteExercisePlan,
);

module.exports = router;
