import { DataTypes } from "sequelize";
import { sequelize } from ".";

const Event = sequelize.define(
  "Event",
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
    start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end: {
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
  },
  {
    modelName: "Event",
    tableName: "events",
    timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  }
);

export default Event