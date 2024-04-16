import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';
import { IBookmark } from './types.js';
import User from './user.js';

const Bookmark = sequelize.define<IBookmark>('Bookmark', {
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
      model: User,
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
// User와 Bookmark 간의 관계
User.hasMany(Bookmark, { foreignKey: 'fk_user_id' });
Bookmark.belongsTo(User, { foreignKey: 'fk_user_id' });
export default Bookmark;
