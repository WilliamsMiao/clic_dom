const User = require('../models/User');
const Match = require('../models/Match');
const MatchQueue = require('../models/MatchQueue');
const UserRank = require('../models/UserRank');
const { redisClient } = require('../config/database');
const { calculateRatingChange } = require('../utils/eloRating');
const { Op } = require('sequelize');

// 匹配队列键
const MATCH_QUEUE_KEY = 'match:queue';
// 匹配超时（毫秒）
const MATCH_TIMEOUT = parseInt(process.env.MATCH_TIMEOUT) || 60000;
// ELO K因子
const ELO_K_FACTOR = parseInt(process.env.ELO_K_FACTOR) || 32;

/**
 * 加入匹配队列
 * @route POST /api/match/join
 * @access Private
 */
// 简化版本，不使用数据库模型

// 加入匹配队列
exports.joinMatchQueue = async (req, res) => {
  try {
    // 简化版，实际上不存储任何数据
    return res.status(200).json({
      success: true,
      message: '已加入匹配队列'
    });
  } catch (error) {
    console.error('加入匹配队列错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 离开匹配队列
exports.leaveMatchQueue = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: '已离开匹配队列'
    });
  } catch (error) {
    console.error('离开匹配队列错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取排行榜
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'fisherman' } = req.query;
    
    // 返回模拟数据
    const mockLeaderboard = Array(20).fill().map((_, index) => ({
      userId: `user-${index + 1}`,
      username: `玩家${index + 1}`,
      avatar: `/avatars/default${index % 5 + 1}.png`,
      rank: index + 1,
      eloRating: 1500 - index * 15,
      wins: 10 + Math.floor(Math.random() * 40),
      losses: 5 + Math.floor(Math.random() * 20),
      winRate: 0.5 + Math.random() * 0.4
    }));
    
    return res.status(200).json(mockLeaderboard);
  } catch (error) {
    console.error('获取排行榜错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取用户排名
exports.getUserRank = async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? 'user-1' : req.params.userId;
    
    // 返回模拟数据
    return res.status(200).json({
      userId: userId,
      username: '当前玩家',
      avatar: '/avatars/default1.png',
      rank: 5,
      eloRating: 1420,
      wins: 24,
      losses: 12,
      winRate: 0.67
    });
  } catch (error) {
    console.error('获取用户排名错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};