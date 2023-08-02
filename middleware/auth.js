const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { User } = require('./models/User');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'your_mysql_host',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'your_database_name',
});

// User 모델과 userSchema 등의 코드는 앞에서 만들어진 코드를 그대로 사용합니다.

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
  res.send('인증되었습니다.');
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다
