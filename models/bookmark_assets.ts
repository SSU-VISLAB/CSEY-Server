import { DataTypes } from 'sequelize';
import Bookmark from './bookmarks.js';
import Event from './events.js';
import { sequelize } from './sequelize.js';

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
      model: Event,
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
  fk_bookmark_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Bookmark,
      key: 'id'
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  modelName: 'BookmarkAsset',
  tableName: 'bookmark_assets',
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  indexes: [{
    unique: true,
    fields: ['fk_bookmark_id', 'fk_event_id']
  }]
});

// Event와 BookmarkAsset 간의 관계
Event.hasMany(BookmarkAsset, { foreignKey: 'fk_event_id' });
BookmarkAsset.belongsTo(Event, { foreignKey: 'fk_event_id' });

// Bookmark와 BookmarkAsset 간의 관계
Bookmark.hasMany(BookmarkAsset, { foreignKey: 'fk_bookmark_id' });
BookmarkAsset.belongsTo(Bookmark, { foreignKey: 'fk_bookmark_id' });
export default BookmarkAsset;
