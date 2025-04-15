const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('FISHERMAN', 'TIGERS'),
    allowNull: false
  },
  winnerId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: true
  },
  loserId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: true
  },
  isDraw: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gameData: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'matches',
  timestamps: true
});

// 添加关联
Match.belongsTo(User, { as: 'winner', foreignKey: 'winnerId' });
Match.belongsTo(User, { as: 'loser', foreignKey: 'loserId' });

module.exports = Match;