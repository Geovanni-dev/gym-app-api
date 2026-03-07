// Importa o Mongoose q é o responsável por modelar os dados do MongoDB
const mongoose = require("mongoose");


// Schema que define a estrutura de um exercício no banco
const exerciseSchema = new mongoose.Schema({

  user: {
    /* Referência ao usuário dono do exercício.
     Cada exercício pertence a um usuário específico*/
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    // Nome do exercício. Ex: Supino, Agachamento, Rosca direta etc etc
    type: String,
    required: true
  },

  muscle: {
    // Grupo muscular trabalhado pelo exercício
    type: String
  },

  createdAt: {
    // Data em que o exercício foi criado
    // default Date.now salva automaticamente o horário atual
    type: Date,
    default: Date.now
  }

});


// Exporta o model para ser utilizado nos controllers
module.exports = mongoose.model("Exercise", exerciseSchema);