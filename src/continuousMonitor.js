import fs from 'fs-extra';
import path from 'path';
import { analyzeWallet } from './services/walletService.js';
import { executeTrade } from './services/tradeService.js';

const tradersPath = path.resolve('./traders.json');
const qualifiedWalletsPath = path.resolve('./qualified_wallets.json');

const CRITERIA = {
  minTrades: 10,
  minWinRate: 70,
  minRealizedPnL: 0.5,
};

async function loadTraders() {
  if (await fs.pathExists(tradersPath)) {
    return fs.readJson(tradersPath);
  }
  return [];
}

async function saveQualifiedWallet(walletData) {
  let qualifiedWallets = [];
  if (await fs.pathExists(qualifiedWalletsPath)) {
    qualifiedWallets = await fs.readJson(qualifiedWalletsPath);
  }

  const exists = qualifiedWallets.some(w => w.walletAddress === walletData.walletAddress);
  if (!exists) {
    qualifiedWallets.push(walletData);
    await fs.writeJson(qualifiedWalletsPath, qualifiedWallets, { spaces: 2 });
    console.log(`✅ Wallet ${walletData.walletAddress} added to qualified wallets.`);
  } else {
    console.log(`ℹ️ Wallet ${walletData.walletAddress} already exists in qualified wallets.`);
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkWallets() {
  const traders = await loadTraders();

  console.log(`🔍 Analyzing ${traders.length} wallets...`);

  for (const walletAddress of traders) {
    const performance = await analyzeWallet(walletAddress);

    if (!performance) {
      console.warn(`⚠️ Wallet: ${walletAddress} returned undefined data.`);
      continue;
    }

    const { totalTrades, winRate, realizedPnL } = performance;

    const qualifies =
      totalTrades >= CRITERIA.minTrades &&
      winRate >= CRITERIA.minWinRate &&
      realizedPnL >= CRITERIA.minRealizedPnL;

    console.log(
      `Wallet: ${walletAddress} | Trades: ${totalTrades} | Win Rate: ${winRate}% | PnL: ${realizedPnL} | Qualifies: ${qualifies}`
    );

    if (qualifies) {
      await saveQualifiedWallet({ walletAddress, ...performance });

      // Execute trade logic
      const inputMint = 'So11111111111111111111111111111111111111112'; // SOL
      const outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
      const tradeAmount = 0.01 * (10 ** 9); // 0.01 SOL in lamports

      console.log(`🔄 Executing trade based on wallet ${walletAddress}`);
      await executeTrade(inputMint, outputMint, tradeAmount);
    }

    // Delay to avoid rate limits (2 seconds)
    await delay(2000);
  }

  console.log('⏰ Check completed. Waiting for next cycle.');
}

async function main() {
  await checkWallets();
  // Run the check every 30 minutes (1800000 milliseconds)
  setInterval(checkWallets, 1800000);
}

main().catch(err => console.error('❌ Error:', err));
