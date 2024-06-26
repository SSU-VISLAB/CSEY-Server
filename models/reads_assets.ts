import { DataTypes } from 'sequelize';
import Read from './reads.js';
import { sequelize } from './sequelize.js';
import { IReadAsset } from './types.js';

const ReadAsset = sequelize.define<IReadAsset>('Read', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
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
  fk_read_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'reads',
      key: 'id'
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  modelName: 'ReadAsset', // 모델 이름
  tableName: 'read_assets', // 데이터베이스 테이블 이름 (선택 사항)
  timestamps: false, // createdAt 및 updatedAt 필드 생성 방지,
  indexes: [{
    unique: true,
    fields: ['fk_read_id', 'fk_notice_id']
  }]
});

Read.hasMany(ReadAsset, { as: 'ReadAssets', foreignKey: 'fk_read_id' });
ReadAsset.belongsTo(Read, {foreignKey: 'fk_read_id'});
export default ReadAsset;
