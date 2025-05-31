const express = require('express');
const router = express.Router();
const { executeTrade } = require('../services/tradeExecutionService');

router.post('/execute', async (req, res) => {
  const { walletPublicKey, inputMint, outputMint, amount } = req.body;

  try {
    const tradeResult = await executeTrade({
      walletPublicKey,
      inputMint,
      outputMint,
      amount,
    });

    res.json(tradeResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
