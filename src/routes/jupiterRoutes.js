import express from 'express';
import axios from 'axios';

const router = express.Router();

const QUICKNODE_API_KEY = 'QN_9300053525b541b9a05a06660dcccb09';

// Fetch Jupiter Swap Quote
router.get('/quote', async (req, res) => {
  const { inputMint, outputMint, amount } = req.query;

  if (!inputMint || !outputMint || !amount) {
    return res.status(400).json({ error: 'inputMint, outputMint, and amount are required' });
  }

  try {
    const url = `https://jupiter-swap-api.quiknode.pro/${QUICKNODE_API_KEY}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Jupiter API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

export default router;
