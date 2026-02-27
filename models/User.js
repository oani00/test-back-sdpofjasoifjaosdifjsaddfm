
/**
 * User Model
 * @typedef {Object} User
 * @property {string} name - User's name
 * @property {string} email - User's email (unique, not enforced in schema)
 * @property {string} password - Hashed password (bcrypt)
 * @property {string} picture_base64 - (Unused, consider removing)
 * @property {ObjectId} picture - Reference to Picture document
 * @property {ObjectId[]} excursions - Array of Excursion references
 */
const mongoose = require('mongoose');

const User = mongoose.model('User', {
    name: String,
    email: String,
    password: String,
    type: { type: String, enum: ['user', 'admin'], required: true },
    picture_base64: String, 
    picture: { type: mongoose.Schema.Types.ObjectId, ref: 'Picture' },
    excursions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Excursion' }]
}, 'users');

module.exports = User;