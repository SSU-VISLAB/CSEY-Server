import { DataTypes } from 'sequelize';
import { sequelize } from './index.ts';

const BookmarkAsset = sequelize.define('BookmarkAsset', {
  fk_event_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Event',
      key: 'id',
    },
  },
  fk_bookmark_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Bookmark',
      key: 'bookmark_id'
    }
  },
}, {
  modelName: 'BookmarkAsset',
  tableName: 'Bookmark_assets',
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
});

export default BookmarkAsset;
