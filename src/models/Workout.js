const mongoose = require("mongoose");

// SCHEMA DE SÉRIES
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

// SCHEMA DE EXERCÍCIOS
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
    default: "8-12",
  },
  weight: {
    type: Number,
    default: 0,
  },
  setsCompleted: [setSchema], // opcional: para tracking de séries
});

// SCHEMA DE DIAS DE TREINO
const daySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  exercises: [exerciseSchema], //  usa o exerciseSchema para definir os exercícios de cada dia, permitindo uma estrutura mais flexível e detalhada para cada exercício, incluindo suas séries, repetições e pesos.
});

// SCHEMA DE TREINOS
const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  goal: {
    type: String,
    enum: ["força", "resistência", "hipertrofia"],
    default: "hipertrofia",
  },
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
    default: "8-12",
  },
  split: [daySchema], // Usa o daySchema com exercises como objetos
  exercises: [exerciseSchema], // Mantido para compatibilidade
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Índices para performance
workoutSchema.index({ user: 1, createdAt: -1 });
workoutSchema.index({ user: 1, goal: 1 });

module.exports = mongoose.model("Workout", workoutSchema);