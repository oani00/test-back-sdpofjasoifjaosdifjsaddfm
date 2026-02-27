const express = require('express');
const router = express.Router();
const excursionController = require('../controllers/excursionController');
const upload = require('../config/multer');

// List all excursions
router.get('/excursions', excursionController.getAllExcursions);

// Get excursion by ID
router.get('/excursions/:id', excursionController.getExcursionById);

// Create new excursion
router.post('/excursions', upload.single('file'), excursionController.createExcursion);

// Update excursion by ID
router.put('/excursions/:id', upload.single('file'), excursionController.updateExcursion);

// Delete excursion by ID
router.delete('/excursions/:id', excursionController.deleteExcursion);

// List users registered for an excursion
router.get('/excursions/:id/users', excursionController.getUsersForExcursion);

module.exports = router;
