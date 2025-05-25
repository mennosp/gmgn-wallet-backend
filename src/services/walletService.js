const axios = require('axios');
require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_URL = `https://api.helius.xyz/v0/addresses`;

async function fetchWalletData(walletAddress) {
  const url = `${HELIUS_URL}/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const transactions = response.data;

    const summary = {
      totalTransfers: transactions.filter(tx => tx.type === 'TRANSFER').length,
      totalSwaps: transactions.filter(tx => tx.type === 'SWAP').length,
      totalIn: 0,
      totalOut: 0,
      tokensIn: {},
      tokensOut: {},
    };

    transactions.forEach(tx => {
      tx.tokenTransfers.forEach(transfer => {
        if (transfer.toUserAccount === walletAddress) {
          summary.totalIn += transfer.amount;
          summary.tokensIn[transfer.tokenSymbol] = (summary.tokensIn[transfer.tokenSymbol] || 0) + transfer.amount;
        } else if (transfer.fromUserAccount === walletAddress) {
          summary.totalOut += transfer.amount;
          summary.tokensOut[transfer.tokenSymbol] = (summary.tokensOut[transfer.tokenSymbol] || 0) + transfer.amount;
        }
      });
    });

    return { summary, rawTransactions: transactions };
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw new Error('Failed to fetch wallet data');
  }
}

module.exports = { fetchWalletData };
