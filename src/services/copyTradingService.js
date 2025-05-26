const { analyzeWallet } = require('./walletService');
const { executeSwap } = require('./tradeExecutionService');

async function evaluateWalletForCopying(walletAddress, myWalletPrivateKey) {
  const walletAnalysis = await analyzeWallet(walletAddress);

  if (!walletAnalysis) {
    console.error('No analysis data found for wallet:', walletAddress);
    return { shouldCopy: false };
  }

  const MIN_WIN_RATE = 70; // Minimum win rate percentage to copy
  const MIN_TOTAL_TRADES = 10; // Minimum number of trades to copy

  const shouldCopy =
    parseFloat(walletAnalysis.winRate) >= MIN_WIN_RATE &&
    walletAnalysis.totalTrades >= MIN_TOTAL_TRADES;

  if (shouldCopy) {
    console.log(`High-performing wallet detected (${walletAnalysis.winRate}% win rate). Copying trades...`);

    // Example token addresses (adjust as necessary)
    const tokenIn = 'So11111111111111111111111111111111111111112'; // SOL
    const tokenOut = 'CqyPJB66ZWraRjXJVmyUv6x9Xnj9kymTJJtkNpiJA9u1'; // Replace this with your target token address
    const amountIn = 0.1; // Adjust based on your preference

    try {
      const swapResult = await executeSwap(myWalletPrivateKey, tokenIn, tokenOut, amountIn);
      console.log('Trade successfully copied:', swapResult);
    } catch (error) {
      console.error('Error executing swap:', error);
      return {
        walletAddress,
        shouldCopy,
        winRate: walletAnalysis.winRate,
        totalTrades: walletAnalysis.totalTrades,
        error: error.message
      };
    }
  } else {
    console.log(`Wallet ${walletAddress} did not meet copy criteria. Win rate: ${walletAnalysis.winRate}%`);
  }

  return {
    walletAddress,
    shouldCopy,
    winRate: walletAnalysis.winRate,
    totalTrades: walletAnalysis.totalTrades,
  };
}

module.exports = { evaluateWalletForCopying };

