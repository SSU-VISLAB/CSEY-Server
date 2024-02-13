import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  fk_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  modelName: 'Bookmark',
  tableName: 'bookmarks',
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
});

export default Bookmark;
