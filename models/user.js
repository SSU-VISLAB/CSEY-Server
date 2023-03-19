const db = require('../mysql/mysql_database');

module.exports = class User {
    constructor({id, nickname, snsProvider}) {
        this.id = id;
        this.nickname = nickname;
        this.snsProvider = snsProvider;
    }

    // 회원가입 정보 DB에 저장
    save() {
        return db.execute('INSERT INTO user (id,nickname,snsProvider) VALUES (?,?,?,?)', [this.id, this.nickname, this.snsProvider]);
    }

    // user_id에 해당하는 유저 정보 출력
    static findUser(user_id) {
        return db.execute('SELECT * FROM user WHERE user.id = ?', [user_id]);
    }
};
