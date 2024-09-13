const mongoose = require('mongoose');

const yearItemSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    // unique: true,
  },
}, {
  timestamps: true
});

itemSchema.index({ year: 1 }, { unique: true }); // Indexing for faster queries

module.exports = mongoose.model('YearItem', yearItemSchema);
