import express from "express";

require('dotenv').config(); // .env파일 필수
const _express = require('express');
const cors = require('cors');
const mysql2 = require('./mysql/mysql_database');
// const corsOptions = {
//     origin: 'https://',
//     credentials: true
// }
const userRoutes = require('./routes/user');

const app = express();
app.use(_express.json());
app.use(_express.urlencoded({ extended: false }));
app.use(cors(/*corsOptions*/));
app.get('/', async (req: express.Request, res: express.Response) => {

});
app.get('/login', (req:express.Request, res:express.Response) => res.sendFile(__dirname + '/testLogin.html'));
app.use('/api', userRoutes);
(async ()=>{
    try{
        const q = `SELECT * FROM CSEY.users;`
        const conn = await mysql2.getConnection();
        const [ result ] = await conn.query(q);
        console.log(result);
    }
    catch(error){

    }
})();

app.listen(3000, () => console.log('Example app listening on port 3000!'));