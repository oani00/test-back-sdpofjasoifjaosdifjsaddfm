/**
 * Picture Controller
 * Handles image retrieval.
 */
const Picture = require('../models/Picture');

/**
 * Get a picture's image data by ID
 * @route GET /pictures/:id
 * @param {string} id - Picture document ID
 * @returns { image data (binary), content-type }
 */
exports.getById = async (req, res) => {
  try {
    const picture = await Picture.findById(req.params.id);
    if (!picture) {
      return res.status(404).json({ message: 'Picture not found.' });
    }
    res.set('Content-Type', picture.contentType);
    res.send(picture.data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar imagem' });
  }
}