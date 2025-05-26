const { analyzeWallet } = require('../services/walletService');

const walletsToAnalyze = [
  '52dq6ajenMwfVz5FYuPKKRzzjkW83Aa85X5xJgFHX7U1',
  'another_wallet_address_here',
  'yet_another_wallet_address_here'
];

async function main() {
  const results = [];

  for (const wallet of walletsToAnalyze) {
    console.log(`Analyzing wallet: ${wallet}`);
    const analysis = await analyzeWallet(wallet);
    if (analysis) {
      results.push(analysis);
      console.log(`✅ ${wallet} - Win Rate: ${analysis.winRate}%, Total Trades: ${analysis.totalTrades}`);
    } else {
      console.log(`❌ Failed to analyze wallet ${wallet}`);
    }
  }

  results.sort((a, b) => b.winRate - a.winRate);
  console.log('\n🔥 Wallet Ranking by Win Rate:');
  results.forEach(({ wallet, winRate, totalTrades }, idx) => {
    console.log(`${idx + 1}. ${wallet} - Win Rate: ${winRate}% (${totalTrades} trades)`);
  });
}

main().catch((error) => {
  console.error('Error during analysis:', error);
});
