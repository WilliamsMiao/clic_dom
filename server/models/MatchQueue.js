const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const MatchQueue = sequelize.define('MatchQueue', {
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
  matchType: {
    type: DataTypes.ENUM('FISHERMAN', 'TIGERS'),
    allowNull: false
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  eloRating: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  }
}, {
  tableName: 'match_queue',
  timestamps: true
});

// 添加关联
MatchQueue.belongsTo(User, { foreignKey: 'userId' });

module.exports = MatchQueue;