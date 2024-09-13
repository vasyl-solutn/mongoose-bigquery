const mongoose = require('mongoose');

const yearItemSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true
});

yearItemSchema.index({ year: 1 }, { unique: true }); // Indexing for faster queries

module.exports = mongoose.model('YearItem', yearItemSchema);
