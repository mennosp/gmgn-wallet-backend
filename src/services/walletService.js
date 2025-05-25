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

module.exports = {
  getWalletTransactions,
};
