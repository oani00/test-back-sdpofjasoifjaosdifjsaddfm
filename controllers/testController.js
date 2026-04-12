
/**
 * Test Controller
 * Simple health check endpoint.
 */
const { logInfo } = require('../utils/logger');

/**
 * @route GET /test
 * @returns {Object} response
 */
exports.test = async (req, res) => {
  await logInfo('[test] health check');
  res.json({ response: "TESTE A 03 01 18 36" });
};
