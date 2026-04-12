/**
 * Picture Controller
 * Handles image retrieval.
 */
const Picture = require('../models/Picture');
const { logInfo, logError } = require('../utils/logger');

/**
 * Get a picture's image data by ID
 * @route GET /pictures/:id
 * @param {string} id - Picture document ID
 * @returns { image data (binary), content-type }
 */
exports.getById = async (req, res) => {
  try {
    await logInfo('[picture.getById] start', { id: req.params.id });
    const picture = await Picture.findById(req.params.id);
    if (!picture) {
      return res.status(404).json({ message: 'Picture not found.' });
    }
    res.set('Content-Type', picture.contentType);
    await logInfo('[picture.getById] ok', { contentType: picture.contentType });
    res.send(picture.data);
  } catch (err) {
    await logError('Error fetching picture by id', { tag: '[picture.getById]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao buscar imagem' });
  }
};