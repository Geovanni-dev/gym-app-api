const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  muscle: {
    type: String,
  },

  sets: {
    type: Number,
    default: 4,
  },

  reps: {
    type: String,
    default: '8-12',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
