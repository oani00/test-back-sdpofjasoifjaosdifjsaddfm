
/**
 * Picture Model
 * Done according to tutorial: https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
 * @typedef {Object} Picture
 * @property {string} name - Picture name
 * @property {Buffer} data - Image binary data
 * @property {string} contentType - MIME type (e.g., 'image/png')
 */
const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const PictureSchema = new Schema({
    name: { type: String, required: true },
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true }
});

module.exports = mongoose.model('Picture', PictureSchema);