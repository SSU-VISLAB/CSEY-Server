import { DataTypes, Model } from 'sequelize';
import Bookmark from './bookmarks.js';
import Event from './events.js';
import { sequelize } from './sequelize.js';

interface BookmarkAssetAttributes {
  id: number;
  fk_event_id: number;
  fk_bookmark_id: number;
}

class BookmarkAsset extends Model<BookmarkAssetAttributes> {
  declare id: number;
  declare fk_event_id: number;
  declare fk_bookmark_id: number;
}

BookmarkAsset.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  fk_event_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'events', // Note: model name should match the table name
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
  fk_bookmark_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'bookmarks', // Note: model name should match the table name
      key: 'id'
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  sequelize,
  modelName: 'BookmarkAsset',
  tableName: 'bookmark_assets',
  timestamps: false,
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
