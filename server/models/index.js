const User = require('./user');
const Soldier = require('./soldier');
const General = require('./general');
const Building = require('./building');
const Item = require('./item');
const { sequelize } = require('../config/database');

// 导入 Op 操作符
const { Op } = require('sequelize');

// 修复 Item 模型中的 Op 引用
Item.checkExpiredItems = async function() {
  const expiredItems = await Item.findAll({
    where: {
      expiresAt: {
        [Op.lt]: new Date()
      },
      marketPrice: {
        [Op.ne]: null
      }
    }
  });
  
  for (const item of expiredItems) {
    // 返回给原所有者或删除
    if (item.userId) {
      await item.removeFromMarket(item.userId);
    } else {
      await item.destroy();
    }
  }
  
  return expiredItems.length;
};

// 同步数据库模型
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('数据库同步完成');
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

module.exports = {
  User,
  Soldier,
  General,
  Building,
  Item,
  syncDatabase
}; 