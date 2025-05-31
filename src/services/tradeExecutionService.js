const axios = require('axios');
const { logTrade } = require('./tradeLogger');

const QUICKNODE_JUPITER_ENDPOINT = 'https://late-white-general.solana-mainnet.quiknode.pro/f2c21ff88d4240dba89e327da10df585dc8070ef/jupiter';

const executeTrade = async ({ walletPublicKey, inputMint, outputMint, amount }) => {
  try {
    const response = await axios.get(`${QUICKNODE_JUPITER_ENDPOINT}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount,
        slippageBps: 50,
        onlyDirectRoutes: false,
      },
      headers: {
        'Accept': 'application/json',
      },
    });

    const quoteResponse = response.data;

    if (!quoteResponse || !quoteResponse.outAmount) {
      throw new Error('No available quote from QuickNode Jupiter endpoint.');
    }

    await logTrade({
      walletPublicKey,
      inputMint,
      outputMint,
      inputAmount: amount,
      outputAmount: quoteResponse.outAmount,
      slippageBps: 50,
      routeDetails: quoteResponse.routePlan,
      status: 'quoted',
    });

    return {
      success: true,
      quoted: true,
      quote: quoteResponse,
    };
  } catch (error) {
    console.error('QuickNode Jupiter API Error:', error.response?.data || error.message);

    await logTrade({
      walletPublicKey,
      inputMint,
      outputMint,
      inputAmount: amount,
      status: 'failed',
      error: error.response?.data || error.message,
    });

    throw error;
  }
};

module.exports = { executeTrade };
