const { User } = require('../models');
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
const joinMatchQueue = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    const rating = user.rating;
    
    // 检查用户是否已在队列中
    const isInQueue = await redisClient.zScore(MATCH_QUEUE_KEY, userId);
    
    if (isInQueue) {
      return res.status(400).json({
        success: false,
        message: '您已在匹配队列中'
      });
    }
    
    // 将用户添加到匹配队列，使用评分作为分数
    await redisClient.zAdd(MATCH_QUEUE_KEY, {
      score: rating,
      value: userId
    });
    
    // 设置匹配超时
    setTimeout(async () => {
      // 检查用户是否仍在队列中
      const stillInQueue = await redisClient.zScore(MATCH_QUEUE_KEY, userId);
      
      if (stillInQueue) {
        // 从队列中移除用户
        await redisClient.zRem(MATCH_QUEUE_KEY, userId);
        
        // 通过Socket.io通知用户匹配超时
        // 这部分将在Socket.io连接处理中实现
      }
    }, MATCH_TIMEOUT);
    
    res.status(200).json({
      success: true,
      message: '已加入匹配队列',
      data: {
        timeout: MATCH_TIMEOUT
      }
    });
    
    // 尝试匹配玩家
    tryMatchPlayers();
  } catch (error) {
    console.error('加入匹配队列错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 离开匹配队列
 * @route POST /api/match/leave
 * @access Private
 */
const leaveMatchQueue = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 检查用户是否在队列中
    const isInQueue = await redisClient.zScore(MATCH_QUEUE_KEY, userId);
    
    if (!isInQueue) {
      return res.status(400).json({
        success: false,
        message: '您不在匹配队列中'
      });
    }
    
    // 从队列中移除用户
    await redisClient.zRem(MATCH_QUEUE_KEY, userId);
    
    res.status(200).json({
      success: true,
      message: '已离开匹配队列'
    });
  } catch (error) {
    console.error('离开匹配队列错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 获取排行榜
 * @route GET /api/match/leaderboard
 * @access Public
 */
const getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 查询排行榜
    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'username', 'nickname', 'avatar', 'level', 'rating', 'wins', 'losses', 'draws'],
      where: {
        isActive: true
      },
      order: [
        ['rating', 'DESC'],
        ['wins', 'DESC']
      ],
      limit,
      offset
    });
    
    // 添加排名和段位信息
    const leaderboard = rows.map((user, index) => ({
      rank: offset + index + 1,
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
      rating: user.rating,
      rankTier: user.getRank(),
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      winRate: user.wins + user.losses > 0 
        ? Math.round((user.wins / (user.wins + user.losses)) * 100) 
        : 0
    }));
    
    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 获取用户排名
 * @route GET /api/match/rank/:userId
 * @access Public
 */
const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 查找用户
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'nickname', 'avatar', 'level', 'rating', 'wins', 'losses', 'draws']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 计算用户排名
    const rank = await User.count({
      where: {
        rating: {
          [Op.gt]: user.rating
        },
        isActive: true
      }
    }) + 1;
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          level: user.level,
          rating: user.rating,
          rankTier: user.getRank(),
          rank,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          winRate: user.wins + user.losses > 0 
            ? Math.round((user.wins / (user.wins + user.losses)) * 100) 
            : 0
        }
      }
    });
  } catch (error) {
    console.error('获取用户排名错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 尝试匹配玩家
 * 根据评分相近原则匹配玩家
 */
const tryMatchPlayers = async () => {
  try {
    // 获取队列中的所有玩家
    const players = await redisClient.zRangeWithScores(MATCH_QUEUE_KEY, 0, -1);
    
    if (players.length < 2) {
      return; // 队列中玩家不足，无法匹配
    }
    
    // 按评分排序
    players.sort((a, b) => a.score - b.score);
    
    // 尝试匹配评分相近的玩家
    for (let i = 0; i < players.length - 1; i++) {
      const player1 = players[i];
      const player2 = players[i + 1];
      
      // 评分差距不超过200分
      if (player2.score - player1.score <= 200) {
        // 从队列中移除这两名玩家
        await redisClient.zRem(MATCH_QUEUE_KEY, player1.value, player2.value);
        
        // 创建对战
        await createMatch(player1.value, player2.value);
        
        // 继续尝试匹配其他玩家
        tryMatchPlayers();
        return;
      }
    }
    
    // 如果队列中玩家等待时间过长，可以放宽匹配条件
    // 这部分可以根据实际需求进行扩展
  } catch (error) {
    console.error('匹配玩家错误:', error);
  }
};

/**
 * 创建对战
 * @param {String} player1Id 玩家1 ID
 * @param {String} player2Id 玩家2 ID
 */
const createMatch = async (player1Id, player2Id) => {
  try {
    // 获取玩家信息
    const player1 = await User.findByPk(player1Id);
    const player2 = await User.findByPk(player2Id);
    
    if (!player1 || !player2) {
      console.error('创建对战失败: 玩家不存在');
      return;
    }
    
    // 创建对战记录
    // 这部分将在游戏服务中实现
    
    // 通过Socket.io通知玩家匹配成功
    // 这部分将在Socket.io连接处理中实现
  } catch (error) {
    console.error('创建对战错误:', error);
  }
};

/**
 * 更新玩家评分
 * @param {String} winnerId 胜利玩家ID
 * @param {String} loserId 失败玩家ID
 * @param {Boolean} isDraw 是否平局
 */
const updatePlayerRatings = async (winnerId, loserId, isDraw = false) => {
  try {
    // 获取玩家信息
    const winner = await User.findByPk(winnerId);
    const loser = await User.findByPk(loserId);
    
    if (!winner || !loser) {
      console.error('更新评分失败: 玩家不存在');
      return;
    }
    
    // 计算评分变化
    const { winnerNewRating, loserNewRating } = calculateRatingChange(
      winner.rating,
      loser.rating,
      isDraw,
      ELO_K_FACTOR
    );
    
    // 更新胜利玩家评分
    winner.rating = winnerNewRating;
    if (isDraw) {
      winner.draws += 1;
    } else {
      winner.wins += 1;
    }
    await winner.save();
    
    // 更新失败玩家评分
    loser.rating = loserNewRating;
    if (isDraw) {
      loser.draws += 1;
    } else {
      loser.losses += 1;
    }
    await loser.save();
    
    return {
      winner: {
        id: winner.id,
        rating: winner.rating,
        ratingChange: winnerNewRating - winner.rating
      },
      loser: {
        id: loser.id,
        rating: loser.rating,
        ratingChange: loserNewRating - loser.rating
      }
    };
  } catch (error) {
    console.error('更新玩家评分错误:', error);
    return null;
  }
};

module.exports = {
  joinMatchQueue,
  leaveMatchQueue,
  getLeaderboard,
  getUserRank,
  updatePlayerRatings
}; 