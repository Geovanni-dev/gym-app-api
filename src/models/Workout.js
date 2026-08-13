const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true,
    min: 0,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
});

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    default: 3,
  },
  reps: {
    type: String,
    default: '8-12',
  },
  weight: {
    type: Number,
    default: 0,
  },
  setsCompleted: [setSchema],
});

const daySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  exercises: [exerciseSchema],
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goal: {
    type: String,
    enum: ['força', 'resistência', 'hipertrofia'],
    default: 'hipertrofia',
  },
  // Quantidade de dias, não a lista deles. A lista fica em split
  days: {
    type: Number,
    min: 1,
    max: 7,
    default: 3,
  },
  sets: {
    type: Number,
    default: 3,
  },
  reps: {
    type: String,
    default: '8-12',
  },
  split: [daySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

workoutSchema.index({ user: 1, createdAt: -1 });
workoutSchema.index({ user: 1, goal: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
