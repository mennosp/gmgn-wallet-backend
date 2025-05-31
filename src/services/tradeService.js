import axios from 'axios';
import dotenv from 'dotenv';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

dotenv.config();

const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');

const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';

const MY_WALLET_PRIVATE_KEY = JSON.parse(process.env.MY_WALLET_PRIVATE_KEY);
const myWallet = Keypair.fromSecretKey(Uint8Array.from(MY_WALLET_PRIVATE_KEY));

export const executeTrade = async (inputMint, outputMint, amount) => {
  console.log("Executing trade:", { inputMint, outputMint, amount });

  try {
    const quoteRes = await axios.get(JUPITER_QUOTE_API, {
      params: { inputMint, outputMint, amount, slippageBps: 50 },
    });

    if (!quoteRes.data || !quoteRes.data.outAmount) {
      throw new Error('Invalid quote from Jupiter');
    }

    const swapRes = await axios.post(JUPITER_SWAP_API, {
      quoteResponse: quoteRes.data,
      userPublicKey: myWallet.publicKey.toString(),
      wrapAndUnwrapSol: true,
    });

    const swapTx = swapRes.data.swapTransaction;
    const txBuffer = Buffer.from(swapTx, 'base64');
    const transaction = VersionedTransaction.deserialize(txBuffer);
    transaction.sign([myWallet]);

    const txid = await connection.sendTransaction(transaction);
    await connection.confirmTransaction(txid);

    console.log('✅ Trade executed:', txid);
    return txid;

  } catch (error) {
    console.error("❌ Error executing trade:", error.response?.data || error.message);
    throw error;
  }
};

export const getTradeLogs = async () => {
  return [];
};
