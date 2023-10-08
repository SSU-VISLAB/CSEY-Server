import { DataTypes } from "sequelize";
import { sequelize } from './sequelize.ts';

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isEndDateAfterStartDate(value: Date) {
          // 사용자 정의 검사 함수: end 날짜가 start 날짜보다 뒤에 있는지 확인
          if (value <= this.start) {
            throw new Error('end 날짜는 start 날짜 이후여야 합니다.');
          }
        },
      },
    },
    major_advisor: {
      type: DataTypes.ENUM("컴퓨터", "소프트"),
      allowNull: false,
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
    expired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  },
  {
    modelName: "Event",
    tableName: "events",
    timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  }
);

export default Event