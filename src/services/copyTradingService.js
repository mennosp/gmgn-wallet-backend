const { analyzeWallet } = require('./walletService');

async function evaluateWalletForCopying(walletAddress) {
  const walletAnalysis = await analyzeWallet(walletAddress);

  const MIN_WIN_RATE = 60; // Minimum win rate percentage to copy
  const MIN_TOTAL_TRADES = 10; // Minimum number of trades to copy

  const shouldCopy = 
    parseFloat(walletAnalysis.winRate) >= MIN_WIN_RATE &&
    walletAnalysis.totalTrades >= MIN_TOTAL_TRADES;

  return {
    walletAddress,
    shouldCopy,
    winRate: walletAnalysis.winRate,
    totalTrades: walletAnalysis.totalTrades
  };
}

module.exports = {
  evaluateWalletForCopying
};
