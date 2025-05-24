const axios = require('axios');

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

async function getSignatures(address, limit = 20) {
  const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "getSignaturesForAddress",
    params: [address, { limit }]
  };

  try {
    const { data } = await axios.post(url, payload);
    return data.result;
  } catch (error) {
    console.error('Helius getSignatures error:', error.response.data);
    throw error;
  }
}

async function getTransactions(signatures) {
  const url = `https://api.helius.xyz/v0/transactions?api-key=${HELIUS_API_KEY}`;

  const payload = { transactions: signatures };

  try {
    const { data } = await axios.post(url, payload);
    return data;
  } catch (error) {
    console.error('Helius getTransactions error:', error.response.data);
    throw error;
  }
}

async function getWalletTransactions(address, limit = 20) {
  try {
    const signatureObjects = await getSignatures(address, limit);
    const signatures = signatureObjects.map(sigObj => sigObj.signature);
    
    const transactions = await getTransactions(signatures);
    
    return transactions;
  } catch (error) {
    console.error('Helius wallet fetch error:', error.response?.data || error.message);
    return [];
  }
}

module.exports = {
  getWalletTransactions,
};
