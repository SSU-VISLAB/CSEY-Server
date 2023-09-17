import { DataTypes } from 'sequelize';
import { sequelize } from "./index.ts";

const ReadAsset = sequelize.define('Read', {
  fk_notice_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Notice', // 외래키가 참조하는 모델의 이름 (테이블 이름)
      key: 'id', // 참조하는 모델의 필드 이름
    },
  },
  fk_read_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'Read',
      key: 'read_id'
    }
  },
}, {
  modelName: 'ReadAsset', // 모델 이름
  tableName: 'read_assets', // 데이터베이스 테이블 이름 (선택 사항)
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
});

export default ReadAsset;
