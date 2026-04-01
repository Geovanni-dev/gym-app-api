// Importa o mongoose para modelar os dados no MongoDB
const mongoose = require("mongoose");

// SCHEMA DE SÉRIES

/* Cada set representa uma série de um exercício;
  Ex: 10 reps com 60kg */
const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true, // CORREÇÃO: garantindo dados
    min: 0,
  },
  weight: {
    type: Number,
    required: true, // CORREÇÃO: garantindo dados
    min: 0,
  },
});

// SCHEMA DE EXERCÍCIOS

/* Um exercício pode possuir várias séries:
   Ex: Supino -> 4 sets */
const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // CORREÇÃO: nome do exercício obrigatório
  },
  sets: [setSchema], // array de séries associadas ao exercício
});

// SCHEMA DE TREINOS.

const workoutSchema = new mongoose.Schema({
  user: {
    /* referência ao usuário dono do treino.
     permitindo separar os treinos de cada pessoa*/
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // CORREÇÃO: obrigatório
  },

  // objetivo do treino (hipertrofia, força ou resistência)
  goal: {
    type: String,
    enum: ["forca", "resistencia", "hipertrofia"], // CORREÇÃO: valores permitidos
    default: "hipertrofia",
  },

  // quantidade de dias de treino na semana
  days: {
    type: Number,
    min: 1,
    max: 7,
    default: 3,
  },

  // número de séries por exercício
  sets: Number,

  // faixa de repetições
  reps: String,

  // divisão do treino gerado automaticamente
  split: [
    {
      day: String,
      exercises: [String],
    },
  ],

  // lista de exercícios realizados no treino
  exercises: [exerciseSchema],

  createdAt: {
    // data em que o treino foi registrado
    type: Date,
    default: Date.now,
  },
});

// Índices para performance
workoutSchema.index({ user: 1, createdAt: -1 });
workoutSchema.index({ user: 1, goal: 1 });

// Exporta o model para ser usado pelos controllers
module.exports = mongoose.model("Workout", workoutSchema);
