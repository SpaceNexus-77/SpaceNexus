// Simulated data
const tokenData = {
  name: 'Space Token',
  symbol: 'SPACE',
  totalSupply: '1000000000',
  decimals: 9,
  currentPrice: 0.00015, // USD
  priceHistory: [
    { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, price: 0.00005 },
    { timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, price: 0.00008 },
    { timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, price: 0.00012 },
    { timestamp: Date.now(), price: 0.00015 }
  ],
  holdersCount: 1250,
  marketCap: 150000, // USD
  volume24h: 25000 // USD
};

// Simulated transaction history
const transactions = [];
for (let i = 0; i < 100; i++) {
  transactions.push({
    id: `tx-${i}`,
    from: `0x${Math.random().toString(16).substr(2, 40)}`,
    to: `0x${Math.random().toString(16).substr(2, 40)}`,
    amount: Math.floor(Math.random() * 1000000),
    timestamp: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    type: Math.random() > 0.5 ? 'buy' : 'sell'
  });
}

// Simulated holder distribution
const holdersDistribution = [
  { range: '0-1000', count: 800 },
  { range: '1000-10000', count: 300 },
  { range: '10000-100000', count: 120 },
  { range: '100000-1000000', count: 25 },
  { range: '1000000+', count: 5 }
];

// Get token information
exports.getTokenInfo = (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        totalSupply: tokenData.totalSupply,
        decimals: tokenData.decimals,
        currentPrice: tokenData.currentPrice,
        marketCap: tokenData.marketCap,
        volume24h: tokenData.volume24h,
        holdersCount: tokenData.holdersCount
      }
    });
  } catch (error) {
    console.error('Failed to get token information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token information',
      error: error.message
    });
  }
};

// Get token price
exports.getTokenPrice = (req, res) => {
  try {
    // Support time range queries
    const { timeRange } = req.query;
    let priceData = tokenData.priceHistory;
    
    if (timeRange) {
      const now = Date.now();
      let timeOffset;
      
      switch (timeRange) {
        case '24h':
          timeOffset = 24 * 60 * 60 * 1000;
          break;
        case '7d':
          timeOffset = 7 * 24 * 60 * 60 * 1000;
          break;
        case '30d':
          timeOffset = 30 * 24 * 60 * 60 * 1000;
          break;
        default:
          timeOffset = 30 * 24 * 60 * 60 * 1000;
      }
      
      priceData = priceData.filter(p => p.timestamp >= now - timeOffset);
    }
    
    res.json({
      success: true,
      data: {
        current: tokenData.currentPrice,
        history: priceData
      }
    });
  } catch (error) {
    console.error('Failed to get token price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token price',
      error: error.message
    });
  }
};

// Get holder statistics
exports.getHoldersStats = (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        total: tokenData.holdersCount,
        distribution: holdersDistribution
      }
    });
  } catch (error) {
    console.error('Failed to get holder statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get holder statistics',
      error: error.message
    });
  }
};

// Get transaction history
exports.getTransactionHistory = (req, res) => {
  try {
    // Support pagination
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    // Support filtering by type
    const { type } = req.query;
    let filteredTxs = transactions;
    
    if (type && ['buy', 'sell'].includes(type)) {
      filteredTxs = transactions.filter(tx => tx.type === type);
    }
    
    // Sort by timestamp (newest first)
    filteredTxs.sort((a, b) => b.timestamp - a.timestamp);
    
    // Pagination
    const paginatedTxs = filteredTxs.slice(offset, offset + limit);
    
    res.json({
      success: true,
      count: filteredTxs.length,
      data: paginatedTxs
    });
  } catch (error) {
    console.error('Failed to get transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction history',
      error: error.message
    });
  }
}; 