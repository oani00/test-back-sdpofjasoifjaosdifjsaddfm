
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
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    birthDate: { type: Date, required: true },
    cpf: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['user', 'admin'], required: true },
    picture_base64: String, 
    picture: { type: mongoose.Schema.Types.ObjectId, ref: 'Picture' },
    excursions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Excursion' }]
}, 'users');

module.exports = User;