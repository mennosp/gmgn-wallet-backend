const { analyzeWallet } = require('./walletService');
const { executeSwap } = require('./tradeExecutionService');

async function evaluateWalletForCopying(walletAddress, myWalletPrivateKey) {
  const analysis = await analyzeWallet(walletAddress);

  if (!analysis) {
    console.error('No analysis data found for wallet:', walletAddress);
    return { shouldCopy: false };
  }

  const shouldCopy = parseFloat(analysis.winRate) >= 70; // Copy wallets with a win rate of 70% or higher

  if (shouldCopy) {
    console.log(`High-performing wallet detected (${analysis.winRate}% win rate). Copying trades...`);

    // Example token addresses (change these accordingly)
    const tokenIn = 'So11111111111111111111111111111111111111112'; // SOL
    const tokenOut = 'CqyPJB66ZWraRjXJVmyUv6x9Xnj9kymTJJtkNpiJA9u1'; // Replace this with your target token address
    const amountIn = 0.1; // Amount to swap (adjust based on your preference)

    try {
      const swapResult = await executeSwap(myWalletPrivateKey, tokenIn, tokenOut, amountIn);
      console.log('Trade successfully copied:', swapResult);
    } catch (error) {
      console.error('Error executing swap:', error);
      return { shouldCopy, error: error.message };
    }
  } else {
    console.log(`Wallet ${walletAddress} did not meet copy criteria. Win rate: ${analysis.winRate}%`);
  }

  return {
    walletAddress,
    shouldCopy,
    winRate: analysis.winRate,
    totalTrades: analysis.totalTrades,
  };
}

module.exports = { evaluateWalletForCopying };
