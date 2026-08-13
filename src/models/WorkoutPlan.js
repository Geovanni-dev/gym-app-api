const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: String, // String porque é faixa, não número exato. Ex: "6-8"
  weight: Number,
  pr: Number,
});

const daySchema = new mongoose.Schema({
  name: String,
  comment: { type: String, default: '' }, // Ainda não implementado
  exercises: [exerciseSchema],
});

const workoutPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  days: [daySchema],
  // Código de compartilhamento do plano entre usuários
  shareCode: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
