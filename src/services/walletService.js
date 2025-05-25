const axios = require('axios');
require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_API_URL = `https://api.helius.xyz/v0/addresses`;

const getWalletTransactions = async (walletAddress) => {
  try {
    const url = `${HELIUS_API_URL}/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.error) {
      console.error("Helius API error:", response.data.error);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Helius wallet fetch error:", error.response ? error.response.data : error.message);
    return [];
  }
};

const getWalletSummary = (transactions, walletAddress) => {
  let totalTransfers = 0;
  let totalSwaps = 0;
  let tokensIn = {};
  let tokensOut = {};

  transactions.forEach((tx) => {
    if (tx.type === 'TRANSFER') totalTransfers++;
    if (tx.type === 'SWAP') totalSwaps++;

    tx.tokenTransfers.forEach((transfer) => {
      const mint = transfer.mint;
      const amount = transfer.amount || 0;
      const owner = transfer.toUserAccount || '';

      if (owner === walletAddress) {
        tokensIn[mint] = (tokensIn[mint] || 0) + amount;
      } else {
        tokensOut[mint] = (tokensOut[mint] || 0) + amount;
      }
    });
  });

  return {
    totalTransfers,
    totalSwaps,
    totalIn: Object.keys(tokensIn).length,
    totalOut: Object.keys(tokensOut).length,
    tokensIn,
    tokensOut,
  };
};

module.exports = {
  getWalletTransactions,
  getWalletSummary,
};
