const express = require('express');
const router = express.Router();
const { 
  getMyCollections,
  getCollectionStats
} = require('../controllers/collectionsController');
const { authenticate } = require('../middlewares/auth');

// 需要认证的路由
router.get('/my', authenticate, getMyCollections);
router.get('/stats', authenticate, getCollectionStats);

module.exports = router;