const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

/**
 * @route GET /test
 * @desc Simple test endpoint
 */
router.get('/test', testController.test);

module.exports = router;
