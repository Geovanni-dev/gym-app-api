// Importa o mongoose para modelar documentos no MongoDB
const mongoose = require("mongoose");

// Schema responsável por armazenar o histórico de execução dos exercícios
const workoutHistorySchema = new mongoose.Schema({
  user: {
    // referência ao usuário que realizou o treino
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // CORREÇÃO: adicionado required para garantir integridade
  },

  plan: {
    // plano de treino ao qual esse exercício pertence
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkoutPlan",
    required: false, // opcional
  },

  /* nome do exercício realizado, o nome é 
   guardado direto aqui para facilitar consultas*/
  exerciseName: {
    type: String,
    required: true, // CORREÇÃO: adicionado required
  },

  // peso utilizado naquela execução do exercício
  weight: {
    type: Number,
    required: true, // CORREÇÃO: adicionado required
    default: 0,
  },

  // número de reps realizadas
  reps: {
    type: Number,
    required: true, // CORREÇÃO: adicionado required
    default: 0,
  },

  date: {
    // momento em que o exercício foi registrado. Padrão salva a data atual
    type: Date,
    default: Date.now,
  },
});

//Adicionado índices para melhor performance
workoutHistorySchema.index({ user: 1, date: -1 });
workoutHistorySchema.index({ user: 1, exerciseName: 1, date: -1 });

// Exporta o model para ser utilizado pelos controllers da aplicação
module.exports = mongoose.model("WorkoutHistory", workoutHistorySchema);
