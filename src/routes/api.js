const express = require('express');
const router = express.Router();
const { getWalletTransactions } = require('../services/walletService');

router.get('/wallet/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const transactions = await getWalletTransactions(address);

    const summary = {
      totalTransfers: transactions.filter(tx => tx.type === 'TRANSFER').length,
      totalSwaps: transactions.filter(tx => tx.type === 'SWAP').length,
      totalIn: transactions.filter(tx => tx.type === 'TRANSFER' && tx.tokenTransfers.some(t => t.toUserAccount === address)).length,
      totalOut: transactions.filter(tx => tx.type === 'TRANSFER' && tx.tokenTransfers.some(t => t.fromUserAccount === address)).length,
      tokensIn: {},
      tokensOut: {},
    };

    transactions.forEach(tx => {
      if (tx.type === 'SWAP') {
        tx.tokenTransfers.forEach(tt => {
          if (tt.toUserAccount === address) summary.tokensIn[tt.mint] = (summary.tokensIn[tt.mint] || 0) + tt.amount;
          if (tt.fromUserAccount === address) summary.tokensOut[tt.mint] = (summary.tokensOut[tt.mint] || 0) + tt.amount;
        });
      }
    });

    res.json({ summary, rawTransactions: transactions });
  } catch (error) {
    console.error('Error in /wallet/:address:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

module.exports = router;
