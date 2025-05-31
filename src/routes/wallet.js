const express = require('express');
const { analyzeWallet } = require('../services/walletService');
const { evaluateWalletForCopying } = require('../services/copyTradingService');

const router = express.Router();

router.get('/:walletAddress', async (req, res) => {
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
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
