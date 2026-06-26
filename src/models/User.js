// Importa o mongoose, responsável por modelar os dados no MongoDB
const mongoose = require('mongoose');

// Schema que define a estrutura de um usuário no sistema
const userSchema = new mongoose.Schema({
  profileImg: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  },

  name: String, // Nome do usuário

  email: String, // email utilizado para login e comunicação

  password: String, // Senha criptografada armazenada no banco

  // Código enviado por email para confirmação da conta
  verificationCode: String,

  isVerified: {
    // Indica se o usuário já confirmou o email
    type: Boolean,
    default: false, // Obs: por padrão todo usuário começa como n verificado
  },

  // codigo gerado quando o usuário solicita recuperação de senha
  resetPasswordCode: String,

  /* Data de expiração do token de recuperação,
  depois desse tempo o link deixa de funcionar*/
  resetPasswordExpires: Date,
});

/* Exporta o model para ser usado pelos controllers da aplicação,
 permitindo criar, ler, atualizar e deletar usuários no banco de dados etc etc */
module.exports = mongoose.model('User', userSchema);
