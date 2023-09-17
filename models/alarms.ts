import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index.js';
import User from './user.ts';

export interface IAlarm {
  alarm_push: boolean;
  event_push: boolean;
  events_timer: number;
  events_post: '북마크' | '전체';
  major_schedule_push: boolean;
  major_schedule_post: boolean;
  notice_push: boolean;
  alerts_push: boolean;
  fk_id: number;
}

class Alarm extends Model<IAlarm, IAlarm> {
  public alarm_push!: boolean;
  public event_push!: boolean;
  public events_timer!: number;
  public events_post!: '북마크' | '전체';
  public major_schedule_push!: boolean;
  public major_schedule_post!: boolean;
  public notice_push!: boolean;
  public alerts_push!: boolean;
  public fk_id!: number;
}

Alarm.init(
  {
    alarm_push: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,

    },
    event_push: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
    events_timer: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 24 * 60 * 60 * 1000,
      validate: {
        isInt: true,
        min: 0,
        max: 24,
      },
    },
    events_post: {
      type: DataTypes.ENUM('북마크', '전체'),
      allowNull: false,
      defaultValue: '전체',
    },
    major_schedule_push: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
    major_schedule_post: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
    notice_push: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
    alerts_push: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
    fk_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      unique: true,
      references: {
        model: User, // User 모델을 참조합니다.
        key: 'id',  // User 모델의 id를 참조합니다.
      },
      onUpdate: "RESTRICT",
      onDelete: "CASCADE"
    },
  },
  {
    sequelize,
    tableName: 'alarms',
    modelName: 'Alarm',
    timestamps: false,
  }
);
Alarm.belongsTo(User, {
  foreignKey: 'fk_id',
  targetKey: 'id',
  as: 'user'
});

export default Alarm;
