import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sequelize.js';

interface AdminAttributes {
  id: number;
  account: string;
  password?: string;
  role: '컴퓨터' | '소프트' | '관리자';
}

class Admin extends Model<AdminAttributes> implements AdminAttributes {
  declare id: number;
  declare account: string;
  declare password: string;
  declare role: '컴퓨터' | '소프트' | '관리자';
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    account: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM('컴퓨터', '소프트', '관리자'),
      allowNull: false,
    },
  },
  {
    sequelize, // assuming you have a Sequelize instance named 'sequelize'
    modelName: 'Admin',
    tableName: 'admins',
    timestamps: false,
  }
);

export default Admin;
