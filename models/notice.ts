import { DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { INotice } from "./types.js";

const Notice = sequelize.define<INotice>(
  "Notice",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    major_advisor: {
      type: DataTypes.ENUM("컴퓨터", "소프트"),
      allowNull: false,
    },
    image: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    like: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    dislike: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    priority: {
      type: DataTypes.ENUM("긴급", "일반"),
      allowNull: false,
    },
    expired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mimeType: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
  },
  {
    modelName: "Notice", // 모델 이름
    tableName: "notices", // 데이터베이스 테이블 이름 (선택 사항)
    timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  }
);

export default Notice