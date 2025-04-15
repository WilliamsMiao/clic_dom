const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Soldier = sequelize.define('Soldier', {
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
  range: {
    type: DataTypes.INTEGER,
    allowNull: false
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
Soldier.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(Soldier, { foreignKey: 'userId', as: 'soldiers' });

// 实例方法：升级
Soldier.prototype.levelUp = function() {
  this.level += 1;
  
  // 根据元素类型和部首增加不同属性
  switch (this.elementType) {
    case '金':
      this.attack += 3;
      this.defense += 2;
      break;
    case '木':
      this.health += 5;
      this.speed += 1;
      break;
    case '水':
      this.speed += 2;
      this.range += 1;
      break;
    case '火':
      this.attack += 4;
      this.speed += 1;
      break;
    case '土':
      this.health += 3;
      this.defense += 3;
      break;
    default:
      break;
  }
  
  return this.save();
};

// 实例方法：计算战斗力
Soldier.prototype.calculatePower = function() {
  return Math.floor(
    this.health * 0.5 +
    this.attack * 1.2 +
    this.defense * 0.8 +
    this.speed * 0.6 +
    this.range * 0.4 +
    this.level * 10
  );
};

module.exports = Soldier; 