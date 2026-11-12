// backend/routes/auth.routes.js
import express from 'express';
import AuthService from '../services/auth.service.js'; 

const router = express.Router();

// 1. 注册接口（配套 AuthService.register）
router.post('/register', async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(200).json({ code: 200, data: result });
  } catch (error) {
    res.status(400).json({ code: 400, msg: error.message });
  }
});

// 2. 登录接口（配套 AuthService.login）
router.post('/login', async (req, res) => {
  try {
    const { userInput, password } = req.body;
    const result = await AuthService.login(userInput, password);
    res.status(200).json({ code: 200, data: result });
  } catch (error) {
    res.status(400).json({ code: 400, msg: error.message });
  }
});

// 3. 发送重置验证码/链接（配套 AuthService.checkUserExists）
router.post('/send-reset-code', async (req, res) => {
  try {
    const { username } = req.body; // username = userInput（用户ID/邮箱/手机号）
    const result = await AuthService.checkUserExists(username);
    // 此处可扩展：真实发送短信/邮箱验证码（如调用阿里云短信接口）
    res.status(200).json({ code: 200, msg: '验证码已发送（模拟）', data: result });
  } catch (error) {
    res.status(400).json({ code: 400, msg: error.message });
  }
});

// 4. 确认重置密码（配套 AuthService.resetPassword）
router.post('/confirm-reset-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const result = await AuthService.resetPassword(username, newPassword);
    res.status(200).json({ code: 200, data: result });
  } catch (error) {
    res.status(400).json({ code: 400, msg: error.message });
  }
});

// 5. 原有：发送重置链接（保留，配套同一业务逻辑）
router.post('/send-reset-link', async (req, res) => {
  try {
    const { username } = req.body;
    const result = await AuthService.checkUserExists(username);
    res.status(200).json({ code: 200, msg: '密码重置链接已发送（模拟）', data: result });
  } catch (error) {
    res.status(400).json({ code: 400, msg: error.message });
  }
});

export default router;