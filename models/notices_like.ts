import { DataTypes } from 'sequelize';
import { sequelize } from '.';

const NoticesLike = sequelize.define('NoticesLike', {
  like: {
    type: DataTypes.ENUM('null', 'like', 'dislike'), // 가능한 버튼 값들
    allowNull: false,
    defaultValue: 'null', // 기본값 설정 (null)
  },
  notice_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Notice', // 외래키가 참조하는 모델의 이름 (테이블 이름)
      key: 'id', // 참조하는 모델의 필드 이름
    },
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'User', // 외래키가 참조하는 모델의 이름 (테이블 이름)
      key: 'id', // 참조하는 모델의 필드 이름
    },
  },
}, {
  modelName: 'NoticesLike', // 모델 이름
  tableName: 'notices_like', // 데이터베이스 테이블 이름 (선택 사항)
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
});

export default NoticesLike;
