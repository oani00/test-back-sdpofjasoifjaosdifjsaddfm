
/**
 * Test Controller
 * Simple health check endpoint.
 */
/**
 * @route GET /test
 * @returns {Object} response
 */
exports.test = (req, res) => {
  res.json({ response: "TESTE A 03 01 18 36" });
};
