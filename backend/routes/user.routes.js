// user.routes.js - 用户专属路由文件
import express from 'express';
// 导入用户控制器（确保路径正确）
import UserController from '../controllers/user.controller.js';

const router = express.Router();

// 获取用户信息（GET请求）
router.get('/profile', UserController.getUserProfile);

// 更新用户信息（POST请求）
router.post('/profile', UserController.updateUserProfile);

export default router;