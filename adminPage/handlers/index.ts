import { ActionQueryParameters } from 'adminjs';
import { EventHandler } from './event.ts';
import { NoticeHandler } from './notice.ts';

export interface EventActionQueryParameters extends ActionQueryParameters {
  /** tab
   * - 진행중 | 종료 */
  type: "ongoing" | "expired"
}

export interface NoticeActionQueryParameters extends ActionQueryParameters {
  /** tab
   * - 긴급 | 일반 | 종료 */
  type: "urgent" | "general" | "expired"
}

export const Handlers = {
  EventHandler,
  NoticeHandler
}