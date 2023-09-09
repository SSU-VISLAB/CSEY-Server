export interface IUser {
  id: number;
  activated: boolean;
  name: string;
  createdDate: Date;
  lastAccess: Date;
  major: '0' | '1';
}

export interface IAlarm {
  alarm_push?: boolean;
  event_push?: boolean;
  events_timer?: number;
  events_post?: boolean;
  major_schedule_push?: boolean;
  major_schedule_post?: boolean;
  notice_push?: boolean;
  alerts_push?: boolean;
  fk_id: number;
}