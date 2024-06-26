import { DataTypes, Model, Optional } from "sequelize";
import Alarm from "./alarms.js";
import Bookmark from "./bookmarks.js";
import Read from "./reads.js";
import { sequelize } from './sequelize.js';
import { IUser } from "./types.js";

export type UserCreationAttributes = Optional<IUser, "id">;

class User extends Model<IUser, UserCreationAttributes> {
  declare id: number;
  declare activated: boolean;
  declare name: string | null;
  declare createdDate: Date;
  declare lastAccess: Date;
  declare major: "컴퓨터" | "소프트";
}

User.init(
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
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastAccess: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    major: {
      type: DataTypes.ENUM("컴퓨터", "소프트"),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User", // 코드상에서 참조할 모델의 이름
    tableName: "users", // 실제 db에서의 테이블 이름
    timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  }
);

User.afterCreate(async (user, options) => {
  Alarm.create({ fk_user_id: user.id }, { transaction: options.transaction });
  Bookmark.create({ fk_user_id: user.id }, { transaction: options.transaction });
  Read.create({ fk_user_id: user.id }, { transaction: options.transaction });
});

export default User;
