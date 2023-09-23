import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.ts';

const BookmarkAsset = sequelize.define('BookmarkAsset', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  fk_event_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
  fk_bookmark_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'bookmarks',
      key: 'id'
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  modelName: 'BookmarkAsset',
  tableName: 'bookmark_assets',
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
});

export default BookmarkAsset;
