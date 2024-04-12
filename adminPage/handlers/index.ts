import { ActionQueryParameters } from 'adminjs';
import { EventHandler } from './event.js';
import { NoticeHandler } from './notice.js';
import { LinktreeHandler } from './linktree.js';

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

export {
  EventHandler,
  NoticeHandler,
  LinktreeHandler
};
