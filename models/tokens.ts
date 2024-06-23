import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js';
import User from './user.js';

interface FCMTokenAttributes {
  id: number;
  fk_user_id: number;
  token: string;
  topics: any; // JSON type
  timer: number;
  createdAt?: Date;
  updatedAt?: Date;
}
interface FCMTokenCreationAttributes extends Optional<FCMTokenAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class FCMToken extends Model<FCMTokenAttributes, FCMTokenCreationAttributes> implements FCMTokenAttributes {
  declare id: number;
  declare fk_user_id: number;
  declare token: string;
  declare topics: string[];
  declare timer: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  declare readonly User?: User;
}

FCMToken.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  fk_user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  topics: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  timer: {
    type: DataTypes.NUMBER.UNSIGNED,
    allowNull: false,
    defaultValue: 24
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'FCMTokens',
  modelName: 'FCMToken',
  indexes: [{
    unique: true,
    fields: ['fk_user_id', 'token']
  }]
});

User.hasMany(FCMToken, { foreignKey: 'fk_user_id' });
FCMToken.belongsTo(User, { foreignKey: 'fk_user_id' });

export default FCMToken
