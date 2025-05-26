const { analyzeWallet } = require('./walletService');
const { executeSwap } = require('./tradeExecutionService');

const MIN_WIN_RATE = 70;        // Minimum required win rate (%)
const MIN_TOTAL_TRADES = 10;    // Minimum required number of trades

async function evaluateWalletForCopying(walletAddress, myWalletPrivateKey) {
  const analysis = await analyzeWallet(walletAddress);

  if (!analysis) {
    console.error('No analysis data found for wallet:', walletAddress);
    return {
      walletAddress,
      shouldCopy: false,
      reason: 'Analysis data unavailable'
    };
  }

  const winRate = parseFloat(analysis.winRate);
  const totalTrades = analysis.totalTrades;

  const shouldCopy = winRate >= MIN_WIN_RATE && totalTrades >= MIN_TOTAL_TRADES;

  if (shouldCopy) {
    console.log(`Wallet ${walletAddress} meets copy criteria (Win Rate: ${winRate}%, Trades: ${totalTrades}). Initiating trade copy...`);

    // Token addresses - Update as needed
    const tokenIn = 'So11111111111111111111111111111111111111112'; // SOL
    const tokenOut = 'CqyPJB66ZWraRjXJVmyUv6x9Xnj9kymTJJtkNpiJA9u1'; // Replace with desired token address
    const amountIn = 0.1; // Amount to swap - customize as necessary

    try {
      const swapResult = await executeSwap(myWalletPrivateKey, tokenIn, tokenOut, amountIn);
      console.log('Trade successfully executed:', swapResult);

      return {
        walletAddress,
        shouldCopy: true,
        swapResult,
        winRate,
        totalTrades
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      return {
        walletAddress,
        shouldCopy: true,
        error: error.message,
        winRate,
        totalTrades
      };
    }
  } else {
    console.log(`Wallet ${walletAddress} did not meet copy criteria (Win Rate: ${winRate}%, Trades: ${totalTrades}).`);
    return {
      walletAddress,
      shouldCopy: false,
      winRate,
      totalTrades
    };
  }
}

module.exports = { evaluateWalletForCopying };
