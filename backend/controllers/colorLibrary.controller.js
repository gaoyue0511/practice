import ColorLibraryService from '../services/colorLibrary.service.js';

const ColorLibraryController = {
  /**
   * 获取公开色彩方案列表
   */
  getPublicColorSchemes: async (req, res) => {
    try {
      const colorData = await ColorLibraryService.getPublicColorSchemes();
      res.status(200).json({
        code: 200,
        message: '获取公开配色列表成功',
        data: colorData
      });
    } catch (error) {
      console.error('获取公开配色失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，无法获取公开配色列表',
        error: process.env.NODE_ENV === 'development' ? error.message : ''
      });
    }
  },

  /**
   * 获取单个配色方案详情
   */
  getSchemeDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const detail = await ColorLibraryService.getSchemeDetail(id);
      res.status(200).json({
        code: 200,
        message: '获取配色详情成功',
        data: detail
      });
    } catch (error) {
      console.error('获取配色详情失败:', error);
      const statusCode = error.message.includes('参数错误') ? 400 : 
                        error.message.includes('不存在') ? 404 : 500;
      res.status(statusCode).json({
        code: statusCode,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : ''
      });
    }
  },

  /**
   * 切换配色收藏状态
   */
  toggleCollect: async (req, res) => {
    try {
      const { schemeId, userId, isCollect } = req.body;
      const result = await ColorLibraryService.toggleCollect(schemeId, userId, isCollect);
      res.status(200).json({
        code: 200,
        message: result.message
      });
    } catch (error) {
      console.error('切换收藏状态失败:', error);
      const statusCode = error.message.includes('参数错误') ? 400 : 
                        error.message.includes('不存在') ? 404 : 500;
      res.status(statusCode).json({
        code: statusCode,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : ''
      });
    }
  },

  /**
   * 获取用户收藏的配色列表
   */
  getUserCollections: async (req, res) => {
    try {
      const { userId } = req.query;
      const collectData = await ColorLibraryService.getUserCollections(userId);
      res.status(200).json({
        code: 200,
        message: '获取收藏列表成功',
        data: collectData
      });
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      const statusCode = error.message.includes('参数错误') ? 400 : 500;
      res.status(statusCode).json({
        code: statusCode,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : ''
      });
    }
  }
};

export default ColorLibraryController;