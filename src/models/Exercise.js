const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  muscle: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
