import express from 'express';
import AuthService from '../services/auth.service.js';
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    const result = await AuthService.register(userData);
    
    res.status(200).json({ 
      code: 200, 
      msg: '注册成功',
      data: result 
    });
  } catch (error) {
    console.error('注册接口错误：', error);
    const errMsg = process.env.NODE_ENV === 'development' 
      ? error.message 
      : '服务器内部错误，请稍后重试';
    res.status(400).json({ 
      code: 400, 
      msg: errMsg 
    });
  }
});

export default router;