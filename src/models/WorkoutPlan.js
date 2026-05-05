// Importa o mongoose para criar schemas e models no MongoDB
const mongoose = require("mongoose");
const { required } = require("zod/mini");

// SCHEMA DE EXERCÍCIO
const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: String, // string pq nao usamos um numero exato de respetições, eu tenho costume de fazer de 6 a 8 (6-8) entao string
  weight: Number,
  pr: Number,
});

// SCHEMA DE DIA DE TREINO
const daySchema = new mongoose.Schema({
  name: String,
  comment: { type: String, default: "" }, // campo para comentários do dia, como observações, dicas, etc (ainda n implementei)
  exercises: [exerciseSchema],
});

// SCHEMA DE PLANO DE TREINO
const workoutPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  days: [daySchema],
  shareCode: { // funçao para gerar um codigo unico de compartilhamento do plano de treino entre usuarios
    type: String,
    unique: true,
  },
});

// Exporta o model
module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);