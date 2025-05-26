const { fetchWalletTrades } = require('../services/walletService');

async function analyzeWallet(wallet) {
  const transactions = await fetchWalletTrades(wallet);
  if (!transactions.length) return null;

  const totalTransactions = transactions.length;
  const uniqueTokens = new Set(transactions.flatMap(tx => tx.tokenTransfers.map(tt => tt.mint))).size;
  const mostRecentTransaction = transactions[0];

  return {
    totalTransactions,
    uniqueTokens,
    mostRecentTransaction,
  };
}

module.exports = { analyzeWallet };
