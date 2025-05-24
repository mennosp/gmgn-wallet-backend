const axios = require('axios');

// Jupiter endpoint for transactions (swap)
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';

async function executeSwapTrade(inputMint, outputMint, amount, userPublicKey) {
  try {
    const response = await axios.post(JUPITER_SWAP_API, {
      inputMint,
      outputMint,
      amount,
      userPublicKey, // Your wallet public key, replace with real key later
      slippageBps: 50, // 0.5% slippage
    });

    return response.data;
  } catch (error) {
    console.error('Jupiter swap execution error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  executeSwapTrade,
};
