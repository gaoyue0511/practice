import express from 'express';
// 关键修复：匹配实际文件名（以下3种情况选其一）

import ColorLibraryController from '../controllers/colorLibrary.controller.js';

const router = express.Router();

// 获取公开色彩方案列表
router.get('/public', ColorLibraryController.getPublicColorSchemes);

// 获取单个方案详情
router.get('/detail/:id', ColorLibraryController.getSchemeDetail);

// 切换收藏状态
router.post('/collect', ColorLibraryController.toggleCollect);

// 获取用户收藏列表
router.get('/collections', ColorLibraryController.getUserCollections);

export default router;