// src/services/tradeLogger.js

const tradeLogs = [];

const logTrade = async (tradeData) => {
  tradeLogs.push(tradeData);
  console.log('Trade logged successfully:', tradeData);
};

const getTradeLogs = async () => {
  return tradeLogs;
};

module.exports = { logTrade, getTradeLogs };
