const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const General = sequelize.define('General', {
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
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  health: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  attack: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defense: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  speed: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  leadership: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '统帅力，影响可指挥的士兵数量'
  },
  strategy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '谋略，影响战场策略效果'
  },
  elementType: {
    type: DataTypes.ENUM('金', '木', '水', '火', '土'),
    allowNull: false
  },
  radical: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '部首'
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  passiveAbilities: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '被动能力'
  },
  rarity: {
    type: DataTypes.ENUM('普通', '稀有', '史诗', '传说'),
    defaultValue: '普通'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

// 关联关系
General.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(General, { foreignKey: 'userId', as: 'generals' });

// 实例方法：升级
General.prototype.levelUp = function() {
  this.level += 1;
  
  // 根据元素类型和部首增加不同属性
  switch (this.elementType) {
    case '金':
      this.attack += 4;
      this.defense += 3;
      this.leadership += 2;
      break;
    case '木':
      this.health += 6;
      this.speed += 2;
      this.strategy += 1;
      break;
    case '水':
      this.speed += 3;
      this.strategy += 3;
      this.defense += 1;
      break;
    case '火':
      this.attack += 5;
      this.speed += 2;
      this.leadership += 1;
      break;
    case '土':
      this.health += 4;
      this.defense += 4;
      this.leadership += 1;
      break;
    default:
      break;
  }
  
  return this.save();
};

// 实例方法：计算战斗力
General.prototype.calculatePower = function() {
  return Math.floor(
    this.health * 0.5 +
    this.attack * 1.0 +
    this.defense * 0.8 +
    this.speed * 0.6 +
    this.leadership * 1.5 +
    this.strategy * 1.2 +
    this.level * 15
  );
};

// 实例方法：获取可指挥的士兵数量
General.prototype.getCommandLimit = function() {
  return Math.floor(this.leadership * 0.5) + this.level;
};

module.exports = General; 