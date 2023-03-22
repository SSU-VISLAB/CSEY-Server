require('dotenv').config(); // .env파일 필수
const express = require('express');
const cors = require('cors');
const mysql2=require('./mysql/mysql_database');
// const corsOptions = {
//     origin: 'https://',
//     credentials: true
// }
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(/*corsOptions*/));
app.get('/', async (req, res) => {

});
app.get('/login', (req, res) => res.sendFile(__dirname + '/testLogin.html'));
app.use('/api', userRoutes);
(async function test() {
    const q = `SELECT * FROM CSEY.test;`
    const conn = await mysql2.getConnection();
    const [ result ] = await conn.query(q);
    console.log(result);
})();

app.listen(3000, () => console.log('Example app listening on port 3000!'));