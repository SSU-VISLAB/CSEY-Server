import mySql from "../mysql/mysql_database";
import { DefaultModel } from "./models";

export interface User {
    id: number;
    activated: boolean;
    name: string;
    createdDate: Date;
    lastAccess: Date;
    major: '0' | '1';
}

export class DBUser extends DefaultModel implements User{
    id: number;
    activated: boolean;
    name: string;
    createdDate: Date;
    lastAccess: Date;
    major: "0" | "1";

    constructor({id, activated, name, createdDate, lastAccess, major}: User) {
        super();
        this.id = id;
        this.activated = activated;
        this.name = name;
        this.createdDate = createdDate;
        this.lastAccess = lastAccess;
        this.major = major;
    }

    // 회원가입 정보 DB에 저장
    async save() {
        const sql = `INSERT INTO users (${this.allKeys}) VALUES (${this.allParams})`;
        const res = await mySql.execute(sql, this.allValues);
        return res;
    }

    // user_id에 해당하는 유저 정보 출력
    static async findUser(user_id: string): Promise<User> {
        const sql = 'SELECT * FROM users WHERE users.id = ?';
        const user = (await mySql.execute(sql, [user_id]))[0][0];
        return user;
    }
};
