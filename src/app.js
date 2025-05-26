const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { analyzeWallet } = require('./services/walletService');
const { evaluateWalletForCopying } = require('./services/copyTradingService');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to analyze a wallet
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

const PORT = process.env.PORT || 10000;
app.listen(10000, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});
