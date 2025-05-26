require('dotenv').config();
const { analyzeWallet } = require('../src/scripts/analyze');

async function main() {
  const walletAddress = process.argv[2];
  if (!walletAddress) {
    console.error('Please provide a wallet address.');
    process.exit(1);
  }

  try {
    const analysis = await analyzeWallet(walletAddress);
    console.log('Analysis Results:', analysis);
  } catch (error) {
    console.error('Error analyzing wallet:', error);
  }
}

main();
