import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import tradeRoutes from './routes/tradeRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/trade', tradeRoutes);
app.use('/wallet', walletRoutes);

// Jupiter Quote Route (corrected to Jupiter v6 API)
app.get('/api/jupiter/quote', async (req, res) => {
  const { inputMint, outputMint, amount } = req.query;

  try {
    const response = await axios.get('https://quote-api.jup.ag/v6/quote', {
      params: {
        inputMint,
        outputMint,
        amount,
        slippageBps: 50
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Jupiter quote:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch Jupiter quote',
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
