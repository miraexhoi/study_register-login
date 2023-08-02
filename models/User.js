const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// MySQL 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host:"127.0.0.1",
  user:"root",
  password:"1234",
  database:"",
  port:3000
});

// 유저 테이블 스키마 & 모델 
const userSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    lastname VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role INT DEFAULT 0,
    image VARCHAR(255),
    token VARCHAR(255),
    tokenExp INT
  )
`;

connection.query(userSchema, (err) => {
  if (err) throw err;
  console.log('Users table created or already exists');
});

// 유저 테이블 스키마와 모델
app.use(express.json());

// 회원가입 API
app.post('/register', (req, res) => {
  const { name, lastname, email, password } = req.body;

  // 비밀번호를 해시화
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;

    const insertUserQuery = `
      INSERT INTO users (name, lastname, email, password)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(
      insertUserQuery,
      [name, lastname, email, hash],
      (err, result) => {
        if (err) throw err;

        console.log('User registered successfully');
        res.status(201).json({ success: true });
      }
    );
  });
});

// 로그인 API
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const getUserQuery = `
    SELECT * FROM users WHERE email = ?
  `;

  connection.query(getUserQuery, [email], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = results[0];

    // 비밀번호 비교
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }

      // 토큰 생성
      const token = jwt.sign(user.id.toString(), 'secretToken');

      const updateUserQuery = `
        UPDATE users SET token = ?, tokenExp = ? WHERE id = ?
      `;

      connection.query(
        updateUserQuery,
        [token, Math.floor(Date.now() / 1000) + 60 * 60 * 24, user.id],
        (err) => {
          if (err) throw err;

          console.log('User logged in successfully');
          res.status(200).json({ success: true, token });
        }
      );
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
