const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { Connection, Keypair } = require('@solana/web3.js');
const { createJupiterApiClient } = require('@jup-ag/api');

const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');
const myWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.MY_WALLET_PRIVATE_KEY)));

const jupiterApi = createJupiterApiClient();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to analyze wallet and evaluate trading
app.get('/api/wallet/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    // Example analysis logic (replace with your actual wallet analysis logic)
    const analysis = {
      wallet: walletAddress,
      winRate: "0.00",
      totalTrades: 0,
    };

    const evaluation = {
      walletAddress,
      shouldCopy: analysis.winRate > "60.00", // example logic
      winRate: analysis.winRate,
      totalTrades: analysis.totalTrades,
    };

    res.json({
      walletAddress,
      analysis,
      evaluation,
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// NEW Endpoint to get swap quote from Jupiter API
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
