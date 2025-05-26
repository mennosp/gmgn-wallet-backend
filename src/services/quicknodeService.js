const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

const QUICKNODE_RPC_URL = process.env.QUICKNODE_RPC_URL;
const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');

async function getBalance(walletAddress) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert from lamports to SOL
  } catch (error) {
    console.error("QuickNode error getting balance:", error);
    return null;
  }
}

module.exports = {
  getBalance,
};
