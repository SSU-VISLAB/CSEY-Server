import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

const Read = sequelize.define('Read', {
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
      model: 'users', // 외래키가 참조하는 모델의 이름 (테이블 이름)
      key: 'id', // 참조하는 모델의 필드 이름
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  modelName: 'Read', // 모델 이름
  tableName: 'reads', // 데이터베이스 테이블 이름 (선택 사항)
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
});

export default Read;
