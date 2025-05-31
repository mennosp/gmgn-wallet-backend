import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

const tradersPath = path.resolve('src', 'traders.json');

const fetchRecentSwaps = async () => {
  const url = `https://api.helius.xyz/v0/addresses/${process.env.USDC_TOKEN_ADDRESS}/transactions?api-key=${process.env.HELIUS_API_KEY}&type=SWAP&limit=50`;
  
  try {
    const { data } = await axios.get(url);
    const wallets = new Set();

    data.forEach(tx => {
      if (tx && tx.feePayer) wallets.add(tx.feePayer);
    });

    return Array.from(wallets);
  } catch (error) {
    console.error('Helius API Error:', error.message);
    return [];
  }
};

const updateTraders = async () => {
  const recentWallets = await fetchRecentSwaps();

  let existingTraders = fs.existsSync(tradersPath)
    ? JSON.parse(fs.readFileSync(tradersPath))
    : [];

  const combinedTraders = Array.from(new Set([...existingTraders, ...recentWallets]));

  fs.writeFileSync(tradersPath, JSON.stringify(combinedTraders, null, 2));
  console.log(`✅ Updated traders.json with ${recentWallets.length} recent wallets.`);
};

setInterval(updateTraders, 10 * 60 * 1000); // every 10 mins
updateTraders();
