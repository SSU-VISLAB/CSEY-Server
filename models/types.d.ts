import { Model } from "sequelize";

export interface IUser {
  id: number;
  activated: boolean;
  name: string;
  createdDate: Date;
  lastAccess: Date;
  major: '컴퓨터' | '소프트';
}

export interface IAlarm {
  id: number;
  alarm_push?: boolean;
  event_push?: boolean;
  events_timer?: number;
  events_form: '북마크' | '전체';
  events_post: boolean;
  major_schedule_push?: boolean;
  major_schedule_post?: boolean;
  notice_push?: boolean;
  alerts_push?: boolean;
  fk_user_id: number;
}

export interface INotice extends Model {
  id: number;
  title?: string;
  content?: string;
  image?: string;
  date?: Date;
  major_advisor?: '컴퓨터' | '소프트';
  like?: number;
  dislike?: number;
  priority?: '긴급' | '일반';
  expired?: boolean;
}

export interface IEvent extends Model {
  id: number;
  title?: string;
  calendar_title?: string;
  content?: string;
  image?: string;
  start?: Date;
  end?: Date;
  major_advisor?: '컴퓨터' | '소프트';
  like?: number;
  dislike?: number;
  expired?: boolean;
  calendar_content?: string;
  calendar_show?: boolean;
}

export interface INoticeLike {
  id: number;
  fk_notice_id: number;
  like?: boolean;
  fk_user_id: number;
}

export interface IEventsLike {
  id: number;
  fk_event_id: number;
  like?: boolean;
  fk_user_id: number;
}

export interface IBookmark extends Model {
  id: number;
  fk_user_id: number;
}

export interface IBookmarkAsset {
  id?: number;
  fk_event_id?: number;
  fk_bookmark_id?: number;
}

export interface IRead extends Model {
  id: number;
  fk_user_id: number;
  ReadAssets?: IReadAsset[];
}

export interface IReadAsset extends Model {
  id: number;
  fk_notice_id: number;
  fk_read_id: number;
}

