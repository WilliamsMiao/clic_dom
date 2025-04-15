const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserRank = sequelize.define('UserRank', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  rankType: {
    type: DataTypes.ENUM('FISHERMAN', 'TIGERS'),
    allowNull: false
  },
  eloRating: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  draws: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  seasonHighest: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  }
}, {
  tableName: 'user_ranks',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'rankType']
    }
  ]
});

// 添加关联
UserRank.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserRank;