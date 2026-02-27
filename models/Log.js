
/**
 * Log Model
 * @typedef {Object} Log
 * @property {string} message - Log message
 * @property {'info'|'warn'|'error'} level - Log level
 * @property {Date} timestamp - Log timestamp
 * @property {any} meta - Extra metadata (userId, etc.)
 */
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  message: String,
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  timestamp: { type: Date, default: Date.now },
  meta: mongoose.Schema.Types.Mixed // for extra data (userId, etc.)
});

module.exports = mongoose.model('Log', logSchema);