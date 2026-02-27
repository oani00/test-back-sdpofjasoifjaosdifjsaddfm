/**
 * Log Controller
 * Handles fetching application logs.
 */
const Log = require('../models/Log');

/**
 * Get all logs
 * @route GET /logs
 * @returns {Log[]} logs (sorted by createdAt desc)
 */
async function getAllLogs(req, res) {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
}

module.exports = { getAllLogs };
