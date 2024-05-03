import { DataTypes, Model } from 'sequelize';
import BookmarkAsset from './bookmark_assets.js';
import { sequelize } from './sequelize.js';
import User from './user.js';

interface BookmarkAttributes {
  id: number;
  fk_user_id: number;
}

interface BookmarkCreationAttributes {
  fk_user_id: number;
}

class Bookmark extends Model<BookmarkAttributes, BookmarkCreationAttributes> {
  public id!: number;
  public fk_user_id!: number;
  public BookmarkAssets?: BookmarkAsset[];
  // Static model name declaration
}

Bookmark.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
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
}, {
  sequelize,
  modelName: 'Bookmark',
  tableName: 'bookmarks',
  timestamps: false,
});

// User와 Bookmark 간의 관계
User.hasMany(Bookmark, { foreignKey: 'fk_user_id' });
Bookmark.belongsTo(User, { foreignKey: 'fk_user_id' });
export default Bookmark;
