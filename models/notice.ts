import { DataTypes } from "sequelize";
import { sequelize } from ".";

const Notice = sequelize.define(
  "Notice",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    major_advisor: {
      type: DataTypes.ENUM("컴퓨터", "소프트"), // 가능한 관리학부 값들
      allowNull: false,
    },
    like: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    dislike: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    priority: {
      type: DataTypes.ENUM("긴급", "일반"), // 가능한 중요도 값들
      allowNull: false,
    },
  },
  {
    modelName: "Notice", // 모델 이름
    tableName: "notices", // 데이터베이스 테이블 이름 (선택 사항)
    timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  }
);

export default Notice