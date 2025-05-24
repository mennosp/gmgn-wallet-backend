const { getWalletTransactions } = require('./walletService');
const { analyzeWalletTransactions } = require('../utils/transactionAnalyzer');
const { executeSwapTrade } = require('./tradeExecutionService');

const TOP_WALLETS = [
  'DqJSyghFZXRWj9eRVMfNWaTvMV7Emkhp6soV4iTVsLhM', // Replace with real top wallets later
];

// Your trading wallet public key (replace with your real key)
const MY_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';

async function getTopWalletTrades() {
  const significantTrades = [];

  for (const wallet of TOP_WALLETS) {
    const txs = await getWalletTransactions(wallet, 50);
    const analyzed = analyzeWalletTransactions(txs);

    txs.forEach(async (tx) => {
      if (tx.type === 'SWAP' && tx.tokenTransfers.some(t => t.amount > 1000)) {
        significantTrades.push({ wallet, tx });

        // Trigger trade execution (simulated for now)
        try {
          const swapResult = await executeSwapTrade(
            tx.tokenTransfers[0].mint,  // inputMint
            tx.tokenTransfers[1].mint,  // outputMint
            tx.tokenTransfers[0].amount, // amount
            MY_PUBLIC_KEY
          );

          console.log('Trade executed successfully:', swapResult);
        } catch (e) {
          console.error('Trade execution failed:', e.message);
        }
      }
    });
  }

  return significantTrades;
}

module.exports = {
  getTopWalletTrades,
};
