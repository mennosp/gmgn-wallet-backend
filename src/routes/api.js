const express = require('express');
const router = express.Router();
const { getWalletTransactions, getWalletSummary } = require('../services/walletService');

router.get('/wallet/:address', async (req, res) => {
  const address = req.params.address;

  try {
    const transactions = await getWalletTransactions(address);
    const summary = getWalletSummary(transactions, address);

    res.json({ summary, rawTransactions: transactions });
  } catch (error) {
    console.error("Error in /wallet/:address:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
