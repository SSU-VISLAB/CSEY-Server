import { DataTypes } from 'sequelize';
import { sequelize } from './index.ts';

const Bookmark = sequelize.define('Bookmark', {
  bookmark_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  fk_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'User',
      key: 'id',
    },
  },
}, {
  modelName: 'Bookmark',
  tableName: 'bookmarks',
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
});

export default Bookmark;
