const express = require('express');
const router = express.Router();
const { getTradeLogs } = require('../services/tradeLogger');

router.get('/trade-logs', async (req, res) => {
  try {
    const tradeLogs = await getTradeLogs();
    res.json({ success: true, tradeLogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
