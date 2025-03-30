const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

// 获取代币信息
router.get('/info', tokenController.getTokenInfo);

// 获取代币价格
router.get('/price', tokenController.getTokenPrice);

// 获取持有者统计
router.get('/holders', tokenController.getHoldersStats);

// 获取交易历史
router.get('/transactions', tokenController.getTransactionHistory);

module.exports = router; 