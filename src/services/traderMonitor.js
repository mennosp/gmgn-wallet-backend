import { Connection, PublicKey, Keypair, VersionedTransaction } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
dotenv.config();

const connection = new Connection(process.env.QUICKNODE_RPC_URL, {
  commitment: 'confirmed',
  maxSupportedTransactionVersion: 0
});

const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.MY_WALLET_PRIVATE_KEY)));

const tradersPath = path.resolve('src', 'traders.json');
const traderLogsPath = path.resolve('src', 'traderLogs.json');
const traderAnalysisPath = path.resolve('src', 'traderAnalysis.json');

const loadTraders = () => JSON.parse(fs.readFileSync(tradersPath));
const saveLogs = (logs) => fs.writeFileSync(traderLogsPath, JSON.stringify(logs, null, 2));
const saveAnalysis = (analysis) => fs.writeFileSync(traderAnalysisPath, JSON.stringify(analysis, null, 2));

const fetchRecentSignatures = async (walletAddress, limit = 5) => {
  const publicKey = new PublicKey(walletAddress);
  return connection.getSignaturesForAddress(publicKey, { limit });
};

const fetchTransactionDetail = async (signature) => {
  return connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
};

const analyzePerformance = (transactions) => {
  const now = Date.now() / 1000;
  const sevenDaysAgo = now - (7 * 24 * 3600);
  const recentTransactions = transactions.filter(tx => tx.timestamp >= sevenDaysAgo && tx.tx);

  let wins = 0;
  recentTransactions.forEach(tx => {
    const preBalance = tx.tx.meta.preTokenBalances?.[0]?.uiTokenAmount.uiAmount || 0;
    const postBalance = tx.tx.meta.postTokenBalances?.[0]?.uiTokenAmount.uiAmount || 0;
    if (postBalance > preBalance) wins += 1;
  });

  const totalTrades = recentTransactions.length;
  const winRate = totalTrades ? (wins / totalTrades) * 100 : 0;

  const initialValue = recentTransactions[recentTransactions.length - 1]?.tx.meta.preBalances[0] || 1;
  const finalValue = recentTransactions[0]?.tx.meta.postBalances[0] || 1;
  const realizedPnL = ((finalValue - initialValue) / initialValue) * 100;

  return {
    totalTrades,
    winRate: parseFloat(winRate.toFixed(2)),
    realizedPnL: parseFloat(realizedPnL.toFixed(2)),
    qualifies: totalTrades >= 10 && winRate >= 70 && realizedPnL >= 30
  };
};

const executeSwap = async (inputMint, outputMint, amount) => {
  try {
    const quoteResponse = await axios.get('https://quote-api.jup.ag/v6/quote', {
      params: { inputMint, outputMint, amount, slippageBps: 50 }
    });

    const { swapTransaction } = (await axios.post('https://quote-api.jup.ag/v6/swap', {
      quoteResponse: quoteResponse.data,
      userPublicKey: wallet.publicKey.toBase58()
    })).data;

    const txBuf = Buffer.from(swapTransaction, 'base64');
    const tx = VersionedTransaction.deserialize(txBuf);
    tx.sign([wallet]);

    const txId = await connection.sendTransaction(tx, { maxRetries: 5 });
    console.log(`✅ Auto-trade executed successfully: ${txId}`);
  } catch (error) {
    console.error('🚨 Auto-trade execution error:', error.message);
  }
};

const monitorTraders = async () => {
  const traders = loadTraders();
  let allLogs = fs.existsSync(traderLogsPath) ? JSON.parse(fs.readFileSync(traderLogsPath)) : [];
  let analysisResults = [];

  for (const walletAddress of traders) {
    try {
      const signatures = await fetchRecentSignatures(walletAddress, 5);
      const existingSignatures = new Set(allLogs.map(log => log.signature));
      const newSignatures = signatures.filter(sig => !existingSignatures.has(sig.signature));

      const newTransactions = [];
      for (const sig of newSignatures) {
        const txDetail = await fetchTransactionDetail(sig.signature);
        if (txDetail) {
          newTransactions.push({
            signature: sig.signature,
            slot: sig.slot,
            timestamp: sig.blockTime,
            walletAddress,
            tx: txDetail
          });
          await new Promise(res => setTimeout(res, 200));
        }
      }

      if (newTransactions.length) {
        console.log(`Fetched ${newTransactions.length} new transactions for ${walletAddress}`);
        allLogs.push(...newTransactions);

        const analysis = analyzePerformance(allLogs.filter(log => log.walletAddress === walletAddress));
        analysisResults.push({ walletAddress, ...analysis });

        if (analysis.qualifies) {
          const lastTrade = newTransactions[0].tx.transaction.message.instructions.find(i => i.program === 'spl-token');
          if (lastTrade) {
            const inputMint = lastTrade.parsed.info.source;
            const outputMint = lastTrade.parsed.info.destination;
            const amount = Math.floor(lastTrade.parsed.info.amount / 10); // smaller trade for testing
            await executeSwap(inputMint, outputMint, amount.toString());
          }
        }

        console.log(`Performance for ${walletAddress}:`, analysis);
      } else {
        console.log(`No new transactions for ${walletAddress}`);
      }
    } catch (error) {
      console.error(`Error for ${walletAddress}:`, error.message);
    }
  }

  saveLogs(allLogs);
  saveAnalysis(analysisResults);
};

setInterval(monitorTraders, 5 * 60 * 1000);
monitorTraders();
