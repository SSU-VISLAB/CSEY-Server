import { Association, DataTypes, Model, Optional } from 'sequelize';
import Event from './events.js';
import { sequelize } from './sequelize.js';
import { IEvent } from './types.js';
import User from './user.js';

interface EventsLikeAttributes {
  id: number;
  like: 'like' | 'dislike' | null
  fk_event_id: number;
  fk_user_id: number;
}

interface EventsLikeCreationAttributes extends Optional<EventsLikeAttributes, 'id'> { }

class EventsLike extends Model<EventsLikeAttributes, EventsLikeCreationAttributes> implements EventsLikeAttributes {
  public id!: number;
  public like: 'like' | 'dislike' | null;
  public fk_event_id!: number;
  public fk_user_id!: number;

  // 여기서 Event 모델을 포함하는 타입을 명시합니다.
  public readonly Event?: IEvent;

  public static associations: {
    Event: Association<EventsLike, IEvent>;
  };
}

EventsLike.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  like: {
    type: DataTypes.ENUM('like', 'dislike'),
    allowNull: true,
    defaultValue: null,
  },
  fk_event_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: Event,
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
  fk_user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
}, {
  modelName: 'EventsLike',
  tableName: 'events_like',
  timestamps: false,
  sequelize,
  indexes: [{
    unique: true,
    fields: ['fk_event_id', 'fk_user_id']
  }]
});
Event.hasMany(EventsLike, { foreignKey: 'fk_event_id' });
EventsLike.belongsTo(Event, { foreignKey: 'fk_event_id' });
export default EventsLike;
