import mySql from "../mysql/mysql_database";
import { DefaultModel } from "./models";

export interface Alarm {
  alarm_push?: '0' | '1';
  event_push?: '0' | '1';
  events_timer?: number;
  events_post?: "0" | "1"; // 북마크 | 전체
  major_schedule_push?: '0' | '1';
  major_schedule_post?: '0' | '1';
  notice_push?: '0' | '1';
  alerts_push?: '0' | '1';
  fk_id: number;
}

export class DBAlarm extends DefaultModel implements Alarm {
  alarm_push: '0' | '1';
  event_push: '0' | '1';
  events_timer: number;
  events_post: "0" | "1";
  major_schedule_push: '0' | '1';
  major_schedule_post: '0' | '1';
  notice_push: '0' | '1';
  alerts_push: '0' | '1';
  fk_id: number;
  constructor({
    alarm_push,
    event_push,
    events_timer,
    events_post,
    major_schedule_push,
    major_schedule_post,
    notice_push,
    alerts_push,
    fk_id,
  }: Alarm, init = false) {
    super();
    if (init) {
        this.fk_id = fk_id;
        return;
    }
    [...this].forEach((key, i) => (this[key] = arguments[i]));
  }

  async saveAll() {
    const sql = `INSERT INTO alarms (${this.allKeys}) VALUES (${this.allParams})`;
    const res = await mySql.execute(sql, this.allValues);
    return res;
  }

  static async findUser(user_id: string): Promise<Alarm> {
    const sql = "SELECT * FROM alarms WHERE alarms.fk_id = ?";
    const user = (await mySql.execute(sql, [user_id]))[0][0];
    return user;
  }

  /**
   * @function
   * @param attr 수정할 속성 명
   * @param value 수정할 속성의 값
   * @param id 수정할 id
   * @sql UPDATE alarms SET {attr} = {value} WHERE fk_id = {id}
   */
  static async updateOne(attr: keyof Alarm, value: any, id: number) {
    const sql = `UPDATE alarms SET ${attr} = ? WHERE fk_id = ?`;
    const res = await mySql.execute(sql, [value, id]);
    return res;
  }
}
