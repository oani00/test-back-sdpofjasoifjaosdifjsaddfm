const express = require('express');
const router = express.Router();
const pictureController = require('../controllers/pictureController');

/**
 * @route GET /pictures/:id
 * @desc Get a picture's image data by document ID
 * @access Public
 * @returns { image data (binary), content-type }
 */
router.get('/pictures/:id', pictureController.getById);



module.exports = router;
