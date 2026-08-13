const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  profileImg: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  },

  name: String,

  email: String,

  password: String,

  verificationCode: String,

  isVerified: {
    type: Boolean,
    default: false,
  },

  resetPasswordCode: String,

  // Depois dessa data o código de recuperação deixa de valer
  resetPasswordExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
