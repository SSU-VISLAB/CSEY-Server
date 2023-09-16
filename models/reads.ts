import { DataTypes } from 'sequelize';
import { sequelize } from "./index.ts";

const Read = sequelize.define('Read', {
  read: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'Notice', // 외래키가 참조하는 모델의 이름 (테이블 이름)
      key: 'id', // 참조하는 모델의 필드 이름
    },
  },
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'User', // 외래키가 참조하는 모델의 이름 (테이블 이름)
      key: 'id', // 참조하는 모델의 필드 이름
    },
  },
}, {
  modelName: 'Read', // 모델 이름
  tableName: 'reads', // 데이터베이스 테이블 이름 (선택 사항)
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
});

export default Read;
