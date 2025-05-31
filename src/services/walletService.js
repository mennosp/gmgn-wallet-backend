import dotenv from 'dotenv';
dotenv.config();

import { Connection, PublicKey } from '@solana/web3.js';

// Initialize Solana connection using QuickNode RPC URL
const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');

// Analyze wallet function
export async function analyzeWallet(walletAddress) {
  try {
    const publicKey = new PublicKey(walletAddress);

    // Fetch recent transaction signatures (up to 20)
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });

    if (!signatures.length) {
      return { error: 'No recent transactions found for this wallet.' };
    }

    // Retrieve parsed transaction details
    const transactions = await Promise.all(
      signatures.map(sig => 
        connection.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 })
      )
    );

    // Filter out null transactions and format trades
    const trades = transactions
      .filter(Boolean)
      .map(tx => ({
        signature: tx.transaction.signatures[0],
        date: new Date(tx.blockTime * 1000).toISOString(),
        instructions: tx.transaction.message.instructions,
        fee: tx.meta.fee,
        status: tx.meta.err ? 'Failed' : 'Successful'
      }));

    return {
      wallet: walletAddress,
      totalTransactions: signatures.length,
      totalTradesAnalyzed: trades.length,
      recentTrades: trades.slice(0, 5),
    };
    
  } catch (error) {
    console.error('Wallet analysis error:', error);
    return { error: `Analysis failed: ${error.message}` };
  }
}
