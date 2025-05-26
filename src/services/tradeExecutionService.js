const { Connection, Keypair, VersionedTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');
const axios = require('axios');

const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';

async function executeSwap(privateKey, tokenIn, tokenOut, amountIn) {
  try {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const wallet = Keypair.fromSecretKey(bs58.decode(privateKey));

    const response = await axios.post(JUPITER_SWAP_API, {
      inputMint: tokenIn,
      outputMint: tokenOut,
      amount: amountIn * 1e9, // Convert SOL to lamports (adjust decimals for other tokens accordingly)
      userPublicKey: wallet.publicKey.toBase58(),
      slippageBps: 50, // 0.5% slippage
    });

    const swapTransaction = response.data.swapTransaction;
    const transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
    transaction.sign([wallet]);

    const txid = await connection.sendTransaction(transaction, { maxRetries: 3 });
    await connection.confirmTransaction(txid);

    return { success: true, txid };
  } catch (error) {
    console.error('Error during Jupiter swap execution:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
}

module.exports = { executeSwap };
