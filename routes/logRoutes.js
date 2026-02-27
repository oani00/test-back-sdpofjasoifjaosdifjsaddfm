const express = require('express');
const router = express.Router();
const { getAllLogs } = require('../controllers/logController');

// GET /logs
router.get('/logs', getAllLogs);

module.exports = router;
