const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Collection = sequelize.define('Collection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  rarity: {
    type: DataTypes.ENUM('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'),
    allowNull: false,
    defaultValue: 'COMMON'
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  category: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'collections',
  timestamps: true
});

module.exports = Collection;