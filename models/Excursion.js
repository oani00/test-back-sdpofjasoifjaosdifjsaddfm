
/**
 * Excursion Model
 * @typedef {Object} Excursion
 * @property {string} name - Excursion name (required)
 * @property {string} description - Description
 * @property {Date} date - Date of excursion
 * @property {string} location - Location
 * @property {number} price - Price
 * @property {'passeio'|'viagem'} type - Excursion type
 * @property {ObjectId[]} pictures - Array of Picture references
 * @property {ObjectId[]} users - Array of User references
 * @property {Date} returnDate - Return date of excursion
 */
const mongoose = require('mongoose');

const excursionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  date: Date,
  returnDate: Date,
  location: String,
  price: Number,
  type: { type: String, enum: ['passeio', 'viagem'], required: true },
  pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Picture' }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Excursion', excursionSchema);
