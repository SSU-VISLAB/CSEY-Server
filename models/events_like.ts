import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.ts';

const EventsLike = sequelize.define('EventsLike', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  like: {
    type: DataTypes.ENUM('null', 'like', 'dislike'),
    allowNull: false,
    defaultValue: 'null',
  },
  fk_event_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
  fk_user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  modelName: 'EventsLike',
  tableName: 'events_like',
  timestamps: false,
  indexes: [{
    unique: true,
    fields: ['fk_event_id', 'fk_user_id']
  }]
});

export default EventsLike;
