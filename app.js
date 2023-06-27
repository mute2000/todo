const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const app = express();
// 输出请求体和响应体数据的格式化字符串
morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(express.json());
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body'));


// 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'db'
});

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
      return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, 'key', (err, user) => {
      if (err) {
          return res.status(401).send('Unauthorized');
      }
      req.user = user; // 将用户信息存储在请求对象中，供后续中间件和路由使用
      next(); // 验证通过，传递控制权给下一个中间件或路由
  });
}

// 定义一个用于验证登录信息的中间件
function checkLogin(req, res, next) {
  const {username, password} = req.body;
  if (username == 'admin' && password == '123456') {
      // 登录输入正确，生成一个JWT Token，并将它存储在客户端的localStorage中
      const token = jwt.sign({username}, 'key');
      res.json({token}); // 返回包含Token的响应体
  } else {
      res.status(401).send('Unauthorized'); // 登录输入错误，返回401错误响应
  }
}
// 用户登录，返回JWT Token给客户端
app.post('/login', checkLogin);

app.use(authenticate);

// 封装 try...catch 中间件函数
const errorWrapper = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

// 使用封装后的中间件函数
app.get('/notes', errorWrapper(async (req, res) => {
  const pageNum = parseInt(req.query.pageNum || 5);
  const pageSize = parseInt(req.query.pageSize || 10);
  const offset = (pageNum - 1) * pageSize;
  const orderBy = req.query.orderBy || 'created_at';

  const columns = {
    created_at: 'created_at',
    updated_at: 'updated_at',
    deleted_at: 'deleted_at'
  };
  const direction = (orderBy.startsWith('-')) ? 'DESC' : 'ASC';
  const orderByColumn = columns[orderBy.replace(/^-/, '')] || 'created_at';

  const [countResult] = await query('SELECT COUNT(*) as total FROM notes WHERE deleted = 0');
  const total = countResult.total;
  const results = await query(`SELECT * FROM notes WHERE deleted = 0 ORDER BY ?? ${direction} LIMIT ? OFFSET ?`, [orderByColumn, pageSize, offset]);
  console.log(JSON.stringify(results, null, 2));
  const totalPages = Math.ceil(total / pageSize);
  res.send({ results, total, totalPages });
}));

app.post('/notes', errorWrapper(async (req, res) => {
  const { title, description } = req.body;
  if (!title && !description) {
    return res.status(400).send({ message: 'Task title and description cannot be empty!' });
  }
  const results = await query('INSERT INTO notes (title, description, done) VALUES (?, ?, 0)', [title, description]);
  res.send({ id: results.insertId, title, description, done: 0 });
}));

app.put('/notes/:id', errorWrapper(async (req, res) => {
  const id = req.params.id;
  const { title, description, done } = req.body;
  const results = await query('UPDATE notes SET title = ?, description = ?, done = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, description, done, id]);
  res.send({ title, description, done });
}));

app.delete('/notes/:id', errorWrapper(async (req, res) => {
  const id = req.params.id;
  const results = await query('UPDATE notes SET deleted = 1,deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  console.log( `Task ${id} has been deleted`);
  res.send({ message: `Task ${id} has been deleted` });
}));

// 封装数据库查询操作，返回 Promise
function query(sql, values) {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}



app.listen(3000, () => {
  console.log('The application is listening on port 3000!');
});
