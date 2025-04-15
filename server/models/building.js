const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const Building = sequelize.define('Building', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
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
      '主城', 
      '资源', 
      '军事', 
      '防御', 
      '研究', 
      '特殊'
    ),
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  health: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defense: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productionRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: '资源产出速率'
  },
  productionType: {
    type: DataTypes.ENUM('金', '木', '水', '火', '土', '无'),
    defaultValue: '无'
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '存储容量'
  },
  effects: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '建筑特殊效果'
  },
  position: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '建筑在地图上的位置'
  },
  constructionTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '建造完成时间'
  },
  upgradeTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '升级完成时间'
  },
  isConstructed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

// 关联关系
Building.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(Building, { foreignKey: 'userId', as: 'buildings' });

// 实例方法：升级
Building.prototype.upgrade = function() {
  if (this.upgradeTime && this.upgradeTime > new Date()) {
    throw new Error('建筑正在升级中');
  }
  
  this.level += 1;
  
  // 根据建筑类型增加不同属性
  switch (this.type) {
    case '主城':
      this.health += 100;
      this.defense += 50;
      this.capacity += 1000;
      break;
    case '资源':
      this.health += 30;
      this.defense += 10;
      this.productionRate += 0.2;
      this.capacity += 500;
      break;
    case '军事':
      this.health += 50;
      this.defense += 30;
      break;
    case '防御':
      this.health += 40;
      this.defense += 60;
      break;
    case '研究':
      this.health += 20;
      this.defense += 15;
      break;
    case '特殊':
      this.health += 35;
      this.defense += 25;
      break;
    default:
      break;
  }
  
  // 设置升级时间（假设每级需要10分钟）
  const upgradeMinutes = 10 * this.level;
  this.upgradeTime = new Date(Date.now() + upgradeMinutes * 60 * 1000);
  
  return this.save();
};

// 实例方法：计算资源产出
Building.prototype.calculateProduction = function(timeInMinutes) {
  if (this.type !== '资源' || !this.isConstructed || !this.isActive) {
    return 0;
  }
  
  return Math.floor(this.productionRate * timeInMinutes);
};

// 实例方法：检查建筑是否已完成建造
Building.prototype.checkConstruction = function() {
  if (this.constructionTime && this.constructionTime <= new Date()) {
    this.isConstructed = true;
    this.constructionTime = null;
    return this.save();
  }
  return Promise.resolve(this);
};

// 实例方法：检查建筑是否已完成升级
Building.prototype.checkUpgrade = function() {
  if (this.upgradeTime && this.upgradeTime <= new Date()) {
    this.upgradeTime = null;
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = Building;