// backend/services/AuthService.js
import pool from '../db/db.js';
import bcrypt from 'bcrypt';

// 配置项
const saltRounds = 10; // 密码加密盐轮数

class AuthService {
  // 1. 注册用户（原有功能优化，密码加密）
  async register(userData) {
    const { user_id, password, email, nickname, phone } = userData;

    // 参数校验
    if (!user_id) {
      throw new Error('用户ID不能为空');
    }
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(user_id)) {
      throw new Error('用户ID需为3-16位字母/数字/下划线');
    }
    if (!password) {
      throw new Error('密码不能为空');
    }
    if (password.length < 6) {
      throw new Error('密码长度不能少于6位');
    }
    if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      throw new Error('请输入有效的邮箱地址');
    }
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('请输入有效的手机号');
    }

    // 检查用户ID是否已存在
    const [userIdRows] = await pool.execute(
      'SELECT id FROM users WHERE user_id = ?',
      [user_id]
    );
    if (userIdRows.length > 0) {
      throw new Error('用户ID已被注册');
    }

    // 检查邮箱是否已存在
    if (email) {
      const [emailRows] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (emailRows.length > 0) {
        throw new Error('邮箱已被注册');
      }
    }

    // 检查手机号是否已存在
    if (phone) {
      const [phoneRows] = await pool.execute(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );
      if (phoneRows.length > 0) {
        throw new Error('手机号已被注册');
      }
    }

    // 密码加密（核心修复：不再明文存储）
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    await pool.execute(
      `INSERT INTO users (
        user_id, password, email, phone, nickname, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        user_id,
        hashedPassword, // 存入加密后的密码
        email || null,
        phone || null,
        nickname ?? user_id // 空值合并，更严谨
      ]
    );

    return { user_id, message: '注册成功' };
  }

  // 2. 用户登录（原有功能优化，密码验证、补充手机号查询）
  async login(userInput, password) {
    if (!userInput || !password) {
      throw new Error('用户ID/邮箱/手机号和密码不能为空');
    }

    // 查询用户（支持 user_id/email/phone 三种方式）
    const [userRows] = await pool.execute(
      `SELECT id, user_id, email, phone, nickname, password 
       FROM users 
       WHERE user_id = ? OR email = ? OR phone = ?`,
      [userInput, userInput, userInput]
    );

    if (userRows.length === 0) {
      throw new Error('用户不存在');
    }

    const user = userRows[0];
    // 验证加密密码（核心修复：不再明文对比）
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('密码错误');
    }

    // 生成简易token（生产环境推荐JWT）
    const token = `token_${Date.now()}_${user.id}`;

    return {
      token,
      user: {
        id: user.id,
        username: user.user_id,
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || ''
      },
      message: '登录成功'
    };
  }

  // 3. 检查用户是否存在（配套密码重置：发送验证码/链接前验证）
  async checkUserExists(userInput) {
    if (!userInput) {
      throw new Error('请输入用户ID/邮箱/手机号');
    }

    const [userRows] = await pool.execute(
      `SELECT id, user_id FROM users 
       WHERE user_id = ? OR email = ? OR phone = ?`,
      [userInput, userInput, userInput]
    );

    if (userRows.length === 0) {
      throw new Error('用户不存在');
    }

    return { userId: userRows[0].id, user_id: userRows[0].user_id, message: '用户存在' };
  }

  // 4. 重置用户密码（配套密码重置：确认重置时更新密码）
  async resetPassword(userInput, newPassword) {
    if (!userInput) {
      throw new Error('请输入用户ID/邮箱/手机号');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('新密码不能为空且长度不能少于6位');
    }

    // 先检查用户是否存在
    const userInfo = await this.checkUserExists(userInput);

    // 新密码加密
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新数据库密码
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [hashedNewPassword, userInfo.user_id]
    );

    return { user_id: userInfo.user_id, message: '密码重置成功' };
  }
}

// 单例导出，供路由层调用
export default new AuthService();