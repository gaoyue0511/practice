import UserService from '../services/user.service.js';

class UserController {
  // 获取用户信息
  async getUserProfile(req, res) {
    try {
      const { userId } = req.query;
      const user = await UserService.getUserProfile(userId);
      
      res.json({
        code: 200,
        data: {
          id: user.id,
          username: user.user_id,
          nickname: user.nickname || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
          bio: user.bio || '',
          role: user.status === 1 ? '普通用户' : '管理员'
        }
      });
    } catch (err) {
      console.error('获取用户信息失败:', err);
      const statusCode = err.message === '用户不存在' ? 404 : 400;
      res.status(statusCode).json({ 
        code: statusCode, 
        msg: err.message 
      });
    }
  }

  // 更新用户信息
  async updateUserProfile(req, res) {
    try {
      const { userId, ...updateData } = req.body;
      await UserService.updateUserProfile(userId, updateData);
      res.json({ code: 200, msg: '用户信息更新成功' });
    } catch (err) {
      console.error('更新用户信息失败:', err);
      res.status(400).json({ 
        code: 400, 
        msg: err.message 
      });
    }
  }
}

export default new UserController();