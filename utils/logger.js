const Log = require('../models/Log');

async function logInfo(message, meta = {}) {
  await Log.create({ message, level: 'info', meta });
}

async function logWarning(message, meta = {}) {
  await Log.create({ message, level: 'warn', meta });
}

async function logError(message, meta = {}) {
  await Log.create({ message, level: 'error', meta });
}

module.exports = { logInfo, logWarning, logError };