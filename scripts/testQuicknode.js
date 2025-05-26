const { getBalance } = require('../src/services/quicknodeService');

async function test() {
  const walletAddress = 'CqyPJB66ZWraRjXJVmyUv6x9Xnj9kymTJJtkNpiJA9u1';
  const balance = await getBalance(walletAddress);
  console.log(`Balance: ${balance} SOL`);
}

test();
