const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  const logsPath = path.join(__dirname, '../logs/trade_logs.json');
  fs.readFile(logsPath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Trade logs read error:", err);
      return res.status(500).json({ error: "Could not read trade logs" });
    }
    const logs = JSON.parse(data);
    res.json(logs);
  });
});

module.exports = router;
