const mongoose = require('mongoose');

const workoutHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: false,
  },

  // Guardado como texto e não como referência, para consultar sem popular
  exerciseName: {
    type: String,
    required: true,
  },

  // Nome do treino/dia. Ex: PUSH, PULL, LEGS
  workoutName: {
    type: String,
    default: null,
  },

  weight: {
    type: Number,
    required: true,
    default: 0,
  },

  reps: {
    type: Number,
    required: true,
    default: 0,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

workoutHistorySchema.index({ user: 1, date: -1 });
workoutHistorySchema.index({ user: 1, exerciseName: 1, date: -1 });
workoutHistorySchema.index({ user: 1, workoutName: 1, date: -1 });

module.exports = mongoose.model('WorkoutHistory', workoutHistorySchema);
