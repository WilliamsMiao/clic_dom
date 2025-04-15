const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Collection = require('./Collection');

const UserCollection = sequelize.define('UserCollection', {
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
  collectionId: {
    type: DataTypes.UUID,
    references: {
      model: Collection,
      key: 'id'
    },
    allowNull: false
  },
  isDisplayed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'user_collections',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'collectionId']
    }
  ]
});

// 添加关联
UserCollection.belongsTo(User, { foreignKey: 'userId' });
UserCollection.belongsTo(Collection, { foreignKey: 'collectionId' });

module.exports = UserCollection;