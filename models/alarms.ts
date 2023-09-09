import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";
import { IAlarm } from "./types";

const Alarm = sequelize.define<Model<IAlarm, IAlarm>>(
  "Alarm",
  {
    alarm_push: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
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
      defaultValue: 24 * 60 * 60 * 1000, // 기본값 설정 (24시간)
      validate: {
        isInt: true, // 정수 형식 검사
        min: 0,
        max: 24,
      },
    },
    events_post: {
      type: DataTypes.ENUM("북마크", "전체"), // 가능한 행사알림 형태 값들
      allowNull: false,
      defaultValue: "전체", // 기본값 설정 (전체)
      validate: {
        isBoolean: true,
      },
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
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'User',
        key: 'id'
      }
    },
  },
  {
    modelName: "Alarm", // 모델 이름
    tableName: "alarms", // 데이터베이스 테이블 이름 (선택 사항)
    timestamps: false, // createdAt 및 updatedAt 필드 생성 방지
  }
);
  
// 훅을 사용하여 alarm_push 속성 값이 변경될 때 실행될 함수 정의
// UPDATE 메서드에서 individualHooks: true 넣어야 사용 가능

// Alarm.beforeUpdate((instance) => {
//   // alarm_push 속성 값이 false로 변경될 때
//   if (instance.getDataValue('alarm_push') == false) {
//     // 다른 속성들을 false로 업데이트
//     console.log('업데이트')
//     instance.setDataValue('alerts_push', false);
//     instance.setDataValue('event_push', false);
//     instance.setDataValue('major_schedule_post', false);
//     instance.setDataValue('major_schedule_push', false);
//     instance.setDataValue('notice_push', false);
//   }
// })

export default Alarm;
