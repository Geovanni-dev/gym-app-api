// Importa o mongoose para criar schemas e models no MongoDB
const mongoose = require("mongoose");

// SCHEMA DE EXERCÍCIO

// Define a estrutura de um exercício dentro de um dia de treino
const exerciseSchema = new mongoose.Schema({
  name: String, // nome do exercício (ex: Supino, Agachamento)

  sets: Number, // quantidade de sets planejadas

  reps: String,
  // número de repetições (string porque pode variar: "8-10", "12", "6-8")

  weight: Number,
  // peso sugerido ou utilizado como base

  pr: Number,
  // possível PR do usuário nesse exercício
});

// SCHEMA DE DIA DE TREINO

// Cada plano pode possuir vários dias (ex: Push, Pull, Legs)
const daySchema = new mongoose.Schema({
  day: String, // nome do dia ou divisão de treino

  // lista de exercícios daquele dia
  exercises: [exerciseSchema],
});

// SCHEMA DE PLANO DE TREINO

const workoutPlanSchema = new mongoose.Schema({
  user: {
    // user dono do plano de treino
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  name: {
    // nome do plano (ex: "PPL", "Upper Lower")
    type: String,
    required: true,
  },

  // lista de dias que compõem o plano
  days: [daySchema],
});

// Exporta o model para uso nos controllers do sistema
module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);
