const { getBalance } = require('../src/services/quicknodeService');

async function test() {
  const walletAddress = 'ydJLarZFLYHYSEm95ToxhHDQWkLdRZXF1mSaQxTamQP';
  const balance = await getBalance(walletAddress);
  console.log(`Balance: ${balance} SOL`);
}

test();
