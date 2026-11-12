import express from 'express';
import AuthService from '../services/auth.service.js';
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password, remember } = req.body;
    const result = await AuthService.login(username, password);

    res.json({
      code: 200,
      data: {
        ...result,
        remember: remember || false
      }
    });
  } catch (error) {
    console.error('登录接口错误：', error);
    const statusCode = error.message === '用户不存在' || error.message === '密码错误' ? 401 : 400;
    res.status(statusCode).json({
      code: statusCode,
      msg: error.message
    });
  }
});

export default router;
