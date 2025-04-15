const Collection = require('../models/Collection');
const UserCollection = require('../models/UserCollection');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// 简化版本，返回模拟数据

// 获取用户收藏品
exports.getMyCollections = async (req, res) => {
    try {
      // 返回模拟数据
      const rarityTypes = ['COMMON', 'UNCOMMON', 'UNCOMMON', 'RARE', 'RARE', 'EPIC', 'LEGENDARY'];
      const mockCollections = Array(12).fill().map((_, index) => ({
        id: `collection-${index + 1}`,
        name: `藏品${index + 1}`,
        description: `这是一个珍贵的收藏品，拥有特殊能力。`,
        imageUrl: `/collections/item${index % 6 + 1}.png`,
        rarity: rarityTypes[index % rarityTypes.length],
        value: (index % rarityTypes.length + 1) * 100,
        acquiredAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      }));
      
      return res.status(200).json({
        success: true,
        items: mockCollections
      });
    } catch (error) {
      console.error('获取收藏品错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  };
  
  // 获取收藏品统计
  exports.getCollectionStats = async (req, res) => {
    try {
      // 返回模拟数据
      return res.status(200).json({
        totalValue: 2850,
        percentile: 78,
        totalItems: 12,
        rarityDistribution: {
          common: 2,
          uncommon: 4,
          rare: 3,
          epic: 2,
          legendary: 1
        }
      });
    } catch (error) {
      console.error('获取收藏品统计错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  };