import { DataTypes } from 'sequelize';
import { sequelize } from '.';

const Bookmark = sequelize.define('Bookmark', {
  bookmark: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Event',
      key: 'id',
    },
  },
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
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
