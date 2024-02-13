import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

const NoticesLike = sequelize.define('NoticesLike', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  like: {
    type: DataTypes.ENUM('null', 'like', 'dislike'), // 가능한 버튼 값들
    allowNull: false,
    defaultValue: 'null', // 기본값 설정 (null)
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
  indexes: [{
    unique: true,
    fields: ['fk_notice_id', 'fk_user_id']
  }]
});

export default NoticesLike;
