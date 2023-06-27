const http = require('http');
const Agent = require('agentkeepalive');
const axios = require('axios');

const keepAliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, 
  freeSocketTimeout: 30000, 
});

// 获取任务列表
const getNoteList = async (token) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/notes?pageNum=1&pageSize=2',
    method: 'GET',
    agent: keepAliveAgent,
    headers: {
      Authorization: `Bearer ${token}`
    },
  };

  const req = http.request(options, (res) => {
    let data = '';
    console.log(`状态码：${res.statusCode}`);
    console.log(`响应头：${JSON.stringify(res.headers)}`);
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`响应体：${data}`);
    });
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.end();
};

// 获取 Token
const getToken = async () => {
  const url = 'http://localhost:3000/login';
  const data = { username: 'admin', password: '123456' };
  try {
    const { data: { token }, status, headers } = await axios.post(url, data, {
    });
    console.log(`状态码：${status}`);
    console.log(`响应头：${JSON.stringify(headers)}`);
    console.log(`响应体：${JSON.stringify({ token })}`);
    return token; // 返回 Token
  } catch (error) {
    console.error(error);
  }
};

// 调用 getToken 函数，并将返回的 Token 传入 getNoteList 函数中进行测试
getToken()
  .then(token => getNoteList(token))
  .catch(error => console.error(error))
  .finally(() => {
    console.log('程序运行结束');
    // 阻塞程序退出
    setInterval(() => {}, 1000);
  });
