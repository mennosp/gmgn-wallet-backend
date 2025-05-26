const axios = require('axios');
require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

async function fetchWalletTrades(wallet) {
  try {
    const { data } = await axios.get(
      `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${HELIUS_API_KEY}`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching trades for wallet ${wallet}:`, error.message);
    return [];
  }
}

async function analyzeWallet(wallet) {
  const trades = await fetchWalletTrades(wallet);
  if (!trades.length) return null;

  let profitableTrades = 0;
  let totalTrades = 0;

  trades.forEach((trade) => {
    if (trade.type === 'SWAP') {
      totalTrades++;
      const inputAmount = parseFloat(trade.tokenTransfers[0]?.amount || 0);
      const outputAmount = parseFloat(trade.tokenTransfers[1]?.amount || 0);

      if (outputAmount > inputAmount) profitableTrades++;
    }
  });

  const winRate = totalTrades ? (profitableTrades / totalTrades) * 100 : 0;

  return {
    wallet,
    winRate: winRate.toFixed(2),
    totalTrades,
  };
}

module.exports = {
  fetchWalletTrades,
  analyzeWallet,
};
