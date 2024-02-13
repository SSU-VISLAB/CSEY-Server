import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sequelize.js';
import { IAlarm } from './types.js';

class Alarm extends Model<IAlarm, IAlarm> {
  public id!: number;
  public alarm_push!: boolean;
  public event_push!: boolean;
  public events_timer!: number;
  public events_form!: '북마크' | '전체';
  public events_post!: boolean;
  public major_schedule_push!: boolean;
  public major_schedule_post!: boolean;
  public notice_push!: boolean;
  public alerts_push!: boolean;
  public fk_user_id!: number;
}

Alarm.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
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
      defaultValue: 24,
      validate: {
        isInt: true,
        min: 0,
        max: 24,
      },
    },
    events_post: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
    events_form: {
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
    fk_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: 'users', // User 모델을 참조합니다.
        key: 'id',  // User 모델의 id를 참조합니다.
      },
      onUpdate: "CASCADE",
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

export default Alarm;
