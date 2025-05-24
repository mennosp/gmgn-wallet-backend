const express = require('express');
const router = express.Router();

const { getSwapQuote } = require('../services/jupiterService');
const { getWalletTransactions } = require('../services/walletService');
const { analyzeWalletTransactions } = require('../utils/transactionAnalyzer');
const { getTopWalletTrades } = require('../services/copyTradingService');

// Test route
router.get('/', (req, res) => {
  res.send('API is working!');
});

// Swap quote route
router.get('/swap-quote', async (req, res) => {
  const { inputMint, outputMint, amount } = req.query;

  if (!inputMint || !outputMint || !amount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const quote = await getSwapQuote(inputMint, outputMint, amount);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch swap quote' });
  }
});

// Wallet tracking + analysis route
router.get('/wallet/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const txs = await getWalletTransactions(address);
    const summary = analyzeWalletTransactions(txs);

    res.json({
      summary,
      rawTransactions: txs,
    });
  } catch (error) {
    console.error('Error in /wallet/:address:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

// Copy trading route (NEW)
router.get('/copy-trades', async (req, res) => {
  try {
    const trades = await getTopWalletTrades();
    res.json(trades);
  } catch (error) {
    console.error('Error fetching copy-trades:', error);
    res.status(500).json({ error: 'Failed to fetch copy-trades' });
  }
});

module.exports = router;
