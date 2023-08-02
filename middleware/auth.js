const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
// const User = require('./models/User.js');

const app = express();
const port = 4000;

app.use(express.json());
app.use(cookieParser());

// MySQL 연결 설정
const connection = mysql.createConnection({
  host:"127.0.0.1",
  user:"root",
  password:"1234",
  database:"users",
  port:4000
});

// 권한 인증 미들웨어
const auth = (req, res, next) => {
  let token = req.cookies.x_auth;

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = auth;

// 예시로 루트 엔드포인트를 보호하는 방법
app.get('/', auth, (req, res) => {
  // req.user와 req.token을 사용할 수 있습니다.
  res.send('Authentication complete.');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});