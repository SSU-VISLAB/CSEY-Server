require('dotenv').config(); // .env파일 필수
const express = require('express');
const cors = require('cors');
// const corsOptions = {
//     origin: 'https://',
//     credentials: true
// }

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(/*corsOptions*/));
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/api', userRoutes);


app.listen(3000, () => console.log('Example app listening on port 3000!'));