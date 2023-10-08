import { ActionQueryParameters } from 'adminjs';
import { EventHandler } from './event.ts';
import { NoticeHandler } from './notice.ts';

export interface EventActionQueryParameters extends ActionQueryParameters {
  /** 진행중 | 종료 */
  type: "ongoing" | "ended"
}

export interface NoticeActionQueryParameters extends ActionQueryParameters {
  /** 진행중 | 종료 */
  type: "urgent" | "general" | "expired"
}

export const Handlers = {
  EventHandler,
  NoticeHandler
}