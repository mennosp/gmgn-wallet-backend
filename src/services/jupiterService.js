const axios = require('axios');

const JUPITER_API_URL = 'https://lite-api.jup.ag';

async function getSwapQuote(inputMint, outputMint, amount, slippageBps = 50) {
  try {
    const response = await axios.get(`${JUPITER_API_URL}/swap/v1/quote`, {
      params: {
        inputMint,
        outputMint,
        amount,
        slippageBps,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching swap quote:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getSwapQuote,
};
