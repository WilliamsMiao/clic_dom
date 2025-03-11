const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    comment: '物品所有者，为null表示在市场上'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  character: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      '资源', 
      '装备', 
      '消耗品', 
      '图纸', 
      '宝物', 
      '其他'
    ),
    allowNull: false
  },
  subType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '子类型，如武器、防具等'
  },
  rarity: {
    type: DataTypes.ENUM('普通', '稀有', '史诗', '传说'),
    defaultValue: '普通'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  attributes: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: '物品属性，如攻击力、防御力等'
  },
  effects: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '物品效果'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isStackable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否可堆叠'
  },
  isMarketable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否可交易'
  },
  marketPrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '市场价格，为null表示不在市场上'
  },
  listedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '上架时间'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '到期时间'
  }
}, {
  timestamps: true
});

// 关联关系
Item.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(Item, { foreignKey: 'userId', as: 'items' });

// 实例方法：上架到市场
Item.prototype.listOnMarket = function(price, expirationDays = 7) {
  if (!this.isMarketable) {
    throw new Error('此物品不可交易');
  }
  
  if (this.marketPrice !== null) {
    throw new Error('此物品已在市场上');
  }
  
  this.marketPrice = price;
  this.listedAt = new Date();
  this.expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
  this.userId = null; // 从用户背包中移除
  
  return this.save();
};

// 实例方法：从市场下架
Item.prototype.removeFromMarket = function(userId) {
  if (this.marketPrice === null) {
    throw new Error('此物品不在市场上');
  }
  
  this.marketPrice = null;
  this.listedAt = null;
  this.expiresAt = null;
  this.userId = userId; // 返回到用户背包
  
  return this.save();
};

// 实例方法：购买物品
Item.prototype.purchase = function(buyerId) {
  if (this.marketPrice === null) {
    throw new Error('此物品不在市场上');
  }
  
  if (this.expiresAt && this.expiresAt < new Date()) {
    throw new Error('此物品已过期');
  }
  
  this.marketPrice = null;
  this.listedAt = null;
  this.expiresAt = null;
  this.userId = buyerId;
  
  return this.save();
};

// 实例方法：使用物品
Item.prototype.use = function() {
  if (this.type !== '消耗品') {
    throw new Error('只有消耗品可以使用');
  }
  
  if (this.quantity <= 0) {
    throw new Error('物品数量不足');
  }
  
  this.quantity -= 1;
  
  // 如果数量为0，删除物品
  if (this.quantity === 0) {
    return this.destroy();
  }
  
  return this.save();
};

// 类方法：检查过期物品
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

module.exports = Item; 