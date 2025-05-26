const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

const QUICKNODE_RPC_URL = process.env.QUICKNODE_RPC_URL;
const connection = new Connection(QUICKNODE_RPC_URL, { 
  commitment: 'confirmed', 
  maxSupportedTransactionVersion: 0 
});

async function analyzeWallet(walletAddress) {
  const publicKey = new PublicKey(walletAddress);

  const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 100 });

  let totalTrades = signatures.length;
  let wins = 0;

  for (const sig of signatures) {
    const txDetails = await connection.getParsedTransaction(sig.signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!txDetails) continue;

    let preBalance = txDetails.meta.preBalances.reduce((a, b) => a + b, 0);
    let postBalance = txDetails.meta.postBalances.reduce((a, b) => a + b, 0);

    if (postBalance > preBalance) wins += 1;
  }

  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(2) : "0.00";

  return {
    wallet: walletAddress,
    winRate,
    totalTrades
  };
}

module.exports = {
  analyzeWallet
};
