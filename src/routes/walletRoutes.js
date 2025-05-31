import express from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');

router.get('/balances/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const publicKey = new PublicKey(walletAddress);
    const solBalance = await connection.getBalance(publicKey);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') });

    const tokens = tokenAccounts.value.map(accountInfo => ({
      mint: accountInfo.account.data.parsed.info.mint,
      tokenAmount: accountInfo.account.data.parsed.info.tokenAmount.uiAmount,
    }));

    res.json({ success: true, solBalance: solBalance / 1e9, tokens });
  } catch (error) {
    console.error("Error fetching wallet balances:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
