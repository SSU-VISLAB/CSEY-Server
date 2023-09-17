import { DataTypes } from "sequelize";
import { sequelize } from "./index.ts";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    activated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        isBoolean: true,
      },
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    createdDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lastAccess: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    major: {
      type: DataTypes.ENUM("컴퓨터", "소프트"),
      allowNull: false,
    },
  },
  {
    modelName: "User",
    tableName: "users",
    timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  }
);

export default User