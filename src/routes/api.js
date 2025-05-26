const express = require('express');
const router = express.Router();
const { analyzeWallet } = require('../services/walletService');
const { evaluateWalletForCopying } = require('../services/copyTradingService');

router.get('/wallet/:address', async (req, res) => {
  const walletAddress = req.params.address;

  try {
    const trades = await analyzeWallet(walletAddress);
    const evaluation = await evaluateWalletForCopying(walletAddress);

    res.status(200).json({
      walletAddress,
      analysis: trades,
      evaluation
    });
  } catch (error) {
    console.error(`Error in /wallet/:address:`, error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
