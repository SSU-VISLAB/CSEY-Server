import { ActionQueryParameters } from 'adminjs';
import { EventHandler } from './event.ts';

export interface CustomActionQueryParameters extends ActionQueryParameters {
  /** 진행중 | 종료 */
  type: "ongoing" | "expired"
}

export const Handlers = {
  EventHandler
}