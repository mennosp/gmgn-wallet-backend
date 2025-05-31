const fs = require('fs-extra');
const path = require('path');

// Define your criteria for qualifying wallets
function walletQualifies(performance) {
  return (
    performance.totalTrades >= 10 &&
    performance.winRate >= 50 &&
    performance.realizedPnL > 0
  );
}

// Define the path where qualifying wallets will be saved
const qualifiedWalletsPath = path.join(__dirname, 'qualified-wallets.json');

// Function to save qualified wallet info into a JSON file
async function saveQualifiedWallet(walletAddress, performance) {
  let wallets = [];
  if (await fs.pathExists(qualifiedWalletsPath)) {
    wallets = await fs.readJson(qualifiedWalletsPath);
  }

  // Check if wallet already exists to prevent duplicates
  const alreadyExists = wallets.some((w) => w.walletAddress === walletAddress);
  if (!alreadyExists) {
    wallets.push({ walletAddress, ...performance });
    await fs.writeJson(qualifiedWalletsPath, wallets, { spaces: 2 });
    console.log(`✅ Saved qualified wallet: ${walletAddress}`);
  } else {
    console.log(`⚠️ Wallet ${walletAddress} already saved.`);
  }
}

// Main monitoring function
async function monitorWallet(walletAddress, performance) {
  if (walletQualifies(performance)) {
    await saveQualifiedWallet(walletAddress, performance);
  } else {
    console.log(`Wallet ${walletAddress} does not qualify.`);
  }
}

// Example usage (Replace these with actual monitoring results)
async function main() {
  // Example wallet performances (replace with actual monitored data)
  const walletPerformances = [
    {
      walletAddress: 'ABC123ExampleWallet',
      totalTrades: 20,
      winRate: 60,
      realizedPnL: 1500,
    },
    {
      walletAddress: 'DEF456ExampleWallet',
      totalTrades: 8,
      winRate: 70,
      realizedPnL: 500,
    },
    {
      walletAddress: 'GHI789ExampleWallet',
      totalTrades: 15,
      winRate: 40,
      realizedPnL: 100,
    },
  ];

  // Monitor each wallet
  for (const { walletAddress, totalTrades, winRate, realizedPnL } of walletPerformances) {
    await monitorWallet(walletAddress, { totalTrades, winRate, realizedPnL });
  }
}

// Run the script
main().catch(console.error);
