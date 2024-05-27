import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sequelize.js';

interface LinktreeAttributes {
  id: number;
  src: string;
  text: string;
  major: '컴퓨터' | '소프트';
  order: number;
}

class Linktree extends Model<LinktreeAttributes> implements LinktreeAttributes {
  declare id: number;
  declare src: string;
  declare text: string;
  declare major: '컴퓨터' | '소프트';
  declare order: number;
}

Linktree.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    src: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    major: {
      type: DataTypes.ENUM('컴퓨터', '소프트'),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER({unsigned: true}),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Linktree',
    tableName: 'linktrees',
    timestamps: false,
  }
);

export default Linktree;
