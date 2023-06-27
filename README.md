my-first-project
待办事项管理系统
这是一个使用 Node.js、Express 和 MySQL 搭建的待办事项管理系统，支持用户登录、待办事项的增删改查等功能。

功能
用户登录
待办事项列表的添加、删除（软删除）、修改、查询
待办事项列表查询接口包括分页、排序等功能
技术栈
Node.js
Express
MySQL
JSON Web Token (JWT)
技术细节
使用 express 框架搭建后端服务，mysql 模块连接 MySQL 数据库。
使用 morgan 模块记录请求日志。
使用 jsonwebtoken 模块实现用户登录验证功能，并用中间件简化了此功能。
实现待办事项列表添加、删除（软删除）、修改、查询接口。
实现待办事项列表查询接口包括分页、排序等功能。
项目中使用 Promise, async/await 等方式进行异步编程。
使用中间件封装错误处理，简化异步操作的错误处理。
安装依赖项： $ npm install

启动服务器： $ npm start

查看网站： http://localhost:3000
