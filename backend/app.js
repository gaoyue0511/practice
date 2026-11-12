// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import colorLibraryRoutes from './routes/colorLibrary.routes.js';
import loginRouter from './routes/Login.js';
import registerRouter from './routes/Register.js';
import userRoutes from './routes/user.routes.js';
import ColorGeneratorController from './controllers/colorGenerator.controller.js';
import pool from './db/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 优化跨域（避免前端跨域报错）
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'], // 允许多个前端地址
  credentials: true, // 支持记住密码的Cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body ? `[${Object.keys(req.body).length} keys]` : 'empty');
  next();
});

// 挂载路由（无需修改，保持不变）
app.use('/api/color-library', colorLibraryRoutes);
app.use('/api', loginRouter);
app.use('/api', registerRouter);
app.use('/api/user', userRoutes);

// 新增：颜色生成路由
app.post('/api/color-generator/generate', ColorGeneratorController.generateColors);
app.get('/api/color-generator/styles', ColorGeneratorController.getStyles);
app.post('/api/color-generator/save', ColorGeneratorController.saveAIGeneratedScheme);

// 测试路由
app.post('/api/test-post', (req, res) => {
    console.log('收到POST测试请求');
    console.log('请求体:', req.body);
    res.json({ code: 200, message: '测试成功', data: req.body });
});

// 修复：test-db用execute（和其他接口统一）
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 AS test'); // 替换query为execute
    res.json({ msg: '数据库连接正常', data: rows });
  } catch (err) {
    res.status(500).json({ msg: '数据库连接失败', error: err.message });
  }
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  console.error('错误堆栈:', err.stack);
  
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : ''
  });
});

app.listen(PORT, () => {
  console.log(`Backend server started at http://localhost:${PORT}`);
});
