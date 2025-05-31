import express from 'express';
import { executeTrade } from '../services/tradeService.js';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const router = express.Router();
const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');

// Helper function to log trades explicitly
const logTrade = (tradeData) => {
  const logPath = path.resolve('src', 'tradeLogs.json');
  const logs = JSON.parse(fs.readFileSync(logPath));
  logs.push(tradeData);
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
};

router.post('/execute', async (req, res) => {
  const { inputMint, outputMint, amount, userPublicKey } = req.body;

  try {
    const swapTransaction = await executeTrade(inputMint, outputMint, amount, userPublicKey);
    res.json({ success: true, quote: { swapTransaction } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/submit', async (req, res) => {
  const { signedTransaction } = req.body;

  try {
    const txBuf = Buffer.from(signedTransaction, 'base64');
    const tx = VersionedTransaction.deserialize(txBuf);

    const txId = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txId, 'confirmed');

    // Explicitly log successful trades
    logTrade({
      txId,
      date: new Date().toISOString(),
      status: 'success',
    });

    res.json({ success: true, txId });
  } catch (error) {
    logTrade({
      error: error.message,
      date: new Date().toISOString(),
      status: 'failed',
    });

    res.status(500).json({ success: false, error: error.message });
  }
});

// Retrieve logged trades explicitly
router.get('/logs', (req, res) => {
  try {
    const logPath = path.resolve('src', 'tradeLogs.json');
    const logs = JSON.parse(fs.readFileSync(logPath));
    res.json({ success: true, trades: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
