// 替换原来的 const mysql = require('mysql2/promise');
import mysql from 'mysql2/promise';
import dbConfig from '../config/database.js'; // 注意路径对应你的database.js位置

// 创建数据库连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// 测试连接
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功！');
    connection.release();
  } catch (err) {
    console.error('数据库连接失败：', err.message);
  }
})();

// 导出pool（ES模块导出语法）
export default pool;