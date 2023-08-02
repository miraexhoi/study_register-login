const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const config = require('./config/key');
const { auth } = require('./middleware/auth');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const connection = mysql.createConnection({
    host:"127.0.0.1",
    user:"root",
    password:"1234",
    database:"",
    port:3000
  });

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

connection.query(createUsersTableQuery, (err) => {
  if (err) throw err;
  console.log('Users table created or already exists');
});

const User = {
  create: function (userData, callback) {
    bcrypt.hash(userData.password, 10, function (err, hash) {
      if (err) return callback(err);

      const insertUserQuery = `
        INSERT INTO users (name, lastname, email, password)
        VALUES (?, ?, ?, ?)
      `;

      connection.query(
        insertUserQuery,
        [userData.name, userData.lastname, userData.email, hash],
        (err, result) => {
          if (err) return callback(err);

          console.log('User registered successfully');
          return callback(null, result.insertId);
        }
      );
    });
  },

  findByToken: function (token, callback) {
    jwt.verify(token, 'secretToken', function (err, decoded) {
      if (err) return callback(err);

      const getUserQuery = `
        SELECT * FROM users WHERE id = ?
      `;

      connection.query(getUserQuery, [decoded], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(null, null);

        const user = results[0];
        return callback(null, user);
      });
    });
  },

  comparePassword: function (plainPassword, hashedPassword, callback) {
    bcrypt.compare(plainPassword, hashedPassword, function (err, isMatch) {
      if (err) return callback(err);
      callback(null, isMatch);
    });
  },
};

app.post('/api/users/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: 'There are no users with the provided email.'
        });
      }
  
      User.comparePassword(req.body.password, user.password, (err, isMatch) => {
        if (!isMatch) {
          return res.json({
            loginSuccess: false,
            message: 'Invalid password'
          });
        }
  
        User.generateToken(user._id, (err, token) => {
          if (err) return res.status(400).send(err);
  
          res
            .cookie('x_auth', token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
        });
      });
    });
  });
  
  app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
      _id: req.user.id,
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image
    });
  });
  
  app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate(
      { _id: req.user._id },
      { token: '' },
      (err, user) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({ success: true });
      }
    );
  });
  
  const port = 3000;
  //3000번 포트에서 연결을 청취하고, 연결됬을 시 콜백함수를 실행
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
  
