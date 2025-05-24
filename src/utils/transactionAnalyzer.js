function analyzeWalletTransactions(transactions) {
  const summary = {
    totalTransfers: 0,
    totalSwaps: 0,
    totalIn: 0,
    totalOut: 0,
    tokensIn: {},
    tokensOut: {},
  };

  for (const tx of transactions) {
    if (tx.type === 'TRANSFER') summary.totalTransfers += 1;
    if (tx.type === 'SWAP') summary.totalSwaps += 1;

    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      for (const transfer of tx.tokenTransfers) {
        const { mint, amount, fromUserAccount, toUserAccount } = transfer;

        if (!mint || !amount) continue;

        // Is the wallet receiving or sending?
        if (toUserAccount === tx.feePayer) {
          summary.totalIn += Number(amount);
          summary.tokensIn[mint] = (summary.tokensIn[mint] || 0) + Number(amount);
        } else if (fromUserAccount === tx.feePayer) {
          summary.totalOut += Number(amount);
          summary.tokensOut[mint] = (summary.tokensOut[mint] || 0) + Number(amount);
        }
      }
    }
  }

  return summary;
}

module.exports = {
  analyzeWalletTransactions,
};
