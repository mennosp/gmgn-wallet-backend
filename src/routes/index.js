const express = require('express');
const router = express.Router();

const apiRouter = require('./api');
const tradeRouter = require('./trade');  // ✅ recently created route

router.use('/api', apiRouter);
router.use('/trade', tradeRouter);       // ✅ clearly added route

module.exports = router;
