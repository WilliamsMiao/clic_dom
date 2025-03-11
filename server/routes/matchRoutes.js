const express = require('express');
const router = express.Router();
const { 
  joinMatchQueue, 
  leaveMatchQueue, 
  getLeaderboard, 
  getUserRank 
} = require('../controllers/matchController');
const { authenticate, optionalAuth } = require('../middlewares/auth');

// 需要认证的路由
router.post('/join', authenticate, joinMatchQueue);
router.post('/leave', authenticate, leaveMatchQueue);

// 公开路由
router.get('/leaderboard', getLeaderboard);
router.get('/rank/:userId', getUserRank);

module.exports = router; 