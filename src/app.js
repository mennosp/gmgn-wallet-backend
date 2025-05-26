const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { Connection, Keypair } = require('@solana/web3.js');
const { createJupiterApiClient } = require('@jup-ag/api');
const { analyzeWallet } = require('./services/walletService');
const { evaluateWalletForCopying } = require('./services/copyTradingService');

const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');
const myWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.MY_WALLET_PRIVATE_KEY)));
const jupiterApi = createJupiterApiClient();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to analyze a wallet and evaluate trading
app.get('/api/wallet/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const walletAnalysis = await analyzeWallet(walletAddress);
    if (!walletAnalysis) {
      return res.status(400).json({ error: 'Failed to analyze wallet.' });
    }

    const copyEvaluation = await evaluateWalletForCopying(walletAddress);

    res.json({
      walletAddress,
      analysis: walletAnalysis,
      evaluation: copyEvaluation,
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get swap quote from Jupiter API
app.get('/api/quote', async (req, res) => {
  try {
    const { inputMint, outputMint, amount, slippageBps } = req.query;

    const quote = await jupiterApi.quoteGet({
      inputMint,
      outputMint,
      amount,
      slippageBps: parseInt(slippageBps, 10),
    });

    res.json(quote);
  } catch (error) {
    console.error('Jupiter API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Server listener
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});

