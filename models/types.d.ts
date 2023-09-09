export interface IUser {
  id: number;
  activated: boolean;
  name: string;
  createdDate: Date;
  lastAccess: Date;
  major: '0' | '1';
}

export interface IAlarm {
  alarm_push?: '0' | '1';
  event_push?: '0' | '1';
  events_timer?: number;
  events_post?: "0" | "1";
  major_schedule_push?: '0' | '1';
  major_schedule_post?: '0' | '1';
  notice_push?: '0' | '1';
  alerts_push?: '0' | '1';
  fk_id: number;
}