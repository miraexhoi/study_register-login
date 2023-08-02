const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

// MySQL 연결 설정
const connection = mysql.createConnection({
  host:"127.0.0.1",
  user:"root",
  password:"1234",
  database:"users",
  port:3000
});

// User 모델과 userSchema 등의 코드는 앞에서 만들어진 코드를 그대로 사용

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

// 예시로 루트 엔드포인트를 보호하는 방법
app.get('/', auth, (req, res) => {
  // req.user와 req.token을 사용할 수 있습니다.
  res.send('Authentication complete.');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});