import { Association, DataTypes, Model, Optional } from 'sequelize';
import Notice from './notice.js';
import { sequelize } from './sequelize.js';
import { INotice } from './types.js';

interface NoticesLikeAttributes {
  id: number;
  like: 'like' | 'dislike' | null
  fk_notice_id: number;
  fk_user_id: number;
}

interface NoticesLikeCreationAttributes extends Optional<NoticesLikeAttributes, 'id'> { }

class NoticesLike extends Model<NoticesLikeAttributes, NoticesLikeCreationAttributes> implements NoticesLikeAttributes {
  public id!: number;
  public like: 'like' | 'dislike' | null;
  public fk_notice_id!: number;
  public fk_user_id!: number;

  // 여기서 Notice 모델을 포함하는 타입을 명시합니다.
  public readonly Notice?: INotice;

  public static associations: {
    Notice: Association<NoticesLike, INotice>;
  };
}
NoticesLike.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  like: {
    type: DataTypes.ENUM('like', 'dislike'), // 가능한 버튼 값들
    allowNull: true,
    defaultValue: null,
  },
  fk_notice_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'notices', // 외래키가 참조하는 모델의 이름 (테이블 이름)
      key: 'id', // 참조하는 모델의 필드 이름
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
  fk_user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users', // 외래키가 참조하는 모델의 이름 (테이블 이름)
      key: 'id', // 참조하는 모델의 필드 이름
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  modelName: 'NoticesLike', // 모델 이름
  tableName: 'notices_like', // 데이터베이스 테이블 이름 (선택 사항)
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  sequelize,
  indexes: [{
    unique: true,
    fields: ['fk_notice_id', 'fk_user_id']
  }]
});
Notice.hasMany(NoticesLike, { foreignKey: 'fk_notice_id' });
NoticesLike.belongsTo(Notice, { foreignKey: 'fk_notice_id' });

export default NoticesLike;
