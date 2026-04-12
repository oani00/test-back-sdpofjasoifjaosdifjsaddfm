/**
 * Log Controller
 * Handles fetching application logs.
 */
const Log = require('../models/Log');
const { logInfo, logError } = require('../utils/logger');

/**
 * Get all logs
 * @route GET /logs
 * @returns {Log[]} logs (sorted by createdAt desc)
 */
async function getAllLogs(req, res) {
  try {
    await logInfo('[getAllLogs] start');
    const logs = await Log.find().sort({ timestamp: -1 });
    await logInfo('[getAllLogs] ok', { count: logs.length });
    res.status(200).json(logs);
  } catch (error) {
    await logError('Error fetching application logs', { tag: '[getAllLogs]', message: error?.message, stack: error?.stack, name: error?.name });
    res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
}

module.exports = { getAllLogs };
