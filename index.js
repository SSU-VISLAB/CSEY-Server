// require('dotenv').config(); // .env파일 필수
const express = require('express');
const cors = require('cors');
// const corsOptions = {
//     origin: 'https://',
//     credentials: true
// }
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(/*corsOptions*/));
app.get('/', (req, res) => res.sendFile(__dirname + '/test.html'));
app.get('/login', (req, res) => res.sendFile(__dirname + '/testLogin.html'));
app.use('/api', userRoutes);


app.listen(3000, () => console.log('Example app listening on port 3000!'));