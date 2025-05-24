const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const apiRoutes = require('./routes/api');

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});
