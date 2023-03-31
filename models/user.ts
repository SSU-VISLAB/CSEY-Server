const db = require('../mysql/mysql_database');

module.exports = class User {
    id:number;
    nickname:string;
    snsProvider:string;

    constructor({id, nickname, snsProvider}:{id:number, nickname:string,snsProvider:string}) {
        this.id = id;
        this.nickname = nickname;
        this.snsProvider = snsProvider;
    }

    // 회원가입 정보 DB에 저장
    save() {
        return db.execute('INSERT INTO user (id,nickname,snsProvider) VALUES (?,?,?,?)', [this.id, this.nickname, this.snsProvider]);
    }

    // user_id에 해당하는 유저 정보 출력
    static findUser(user_id:string) {
        return db.execute('SELECT * FROM user WHERE user.id = ?', [user_id]);
    }

    signup(){
        console.log(db.execute(`SELECT * FROM CSEY.users;`));
        console.log('askdfjsakfjkasdjfksadjfk');
        return db.execute(`SELECT * FROM CSEY.users;`)
    }
};
