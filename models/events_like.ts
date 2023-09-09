import { DataTypes } from 'sequelize';
import { sequelize } from '.';

const EventsLike = sequelize.define('EventsLike', {
  like: {
    type: DataTypes.ENUM('null', 'like', 'dislike'),
    allowNull: false,
    defaultValue: 'null',
  },
  event_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Event',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id',
    },
  },
}, {
  modelName: 'EventsLike',
  tableName: 'events_like',
  timestamps: false,
});

export default EventsLike;
