import pool from "../db/db.js";

const mockCodeStore = {};

class AuthController {
  async register(req, res) {
    try {
      const { username, password, email, phone, nickname } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          code: 400,
          message: "用户名和密码不能为空"
        });
      }

      const [existingUsers] = await pool.query(
        `SELECT * FROM user WHERE user_id = ? OR email = ? OR phone = ?`,
        [username, email || username, phone || username]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          code: 409,
          message: "用户名或邮箱或手机号已存在"
        });
      }

      const [result] = await pool.query(
        `INSERT INTO user (user_id, password, email, phone, nickname, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [username, password, email || null, phone || null, nickname || username]
      );

      const mockToken = `token_${result.insertId}_${Date.now()}`;

      res.status(201).json({
        code: 201,
        message: "注册成功",
        data: {
          token: mockToken,
          user: {
            id: result.insertId,
            user_id: username,
            email: email || '',
            nickname: nickname || username
          }
        }
      });
    } catch (err) {
      console.error("注册接口错误：", err.message);
      res.status(500).json({
        code: 500,
        message: "服务器内部错误"
      });
    }
  }

  async login(req, res) {
    try {
      const { username, password, remember } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          code: 400,
          message: "账号（user_id/email/phone）和密码不能为空"
        });
      }

      const [users] = await pool.query(
        `SELECT * FROM user
         WHERE user_id = ? OR email = ? OR phone = ?`,
        [username, username, username]
      );

      if (users.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "用户不存在，请检查账号"
        });
      }

      const user = users[0];
      if (user.password !== password) {
        return res.status(401).json({
          code: 401,
          message: "密码错误，请重新输入"
        });
      }

      const mockToken = `token_${user.id}_${Date.now()}`;
      res.status(200).json({
        code: 200,
        message: "登录成功",
        data: {
          token: mockToken,
          user: {
            id: user.id,
            user_id: user.user_id,
            email: user.email,
            nickname: user.nickname,
            avatar: user.avatar
          },
          remember: remember || false
        }
      });
    } catch (err) {
      console.error("登录接口错误：", err.message);
      res.status(500).json({
        code: 500,
        message: "服务器内部错误"
      });
    }
  }

  async sendResetCode(req, res) {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({
          code: 400,
          message: "请输入user_id/email/phone"
        });
      }

      const [users] = await pool.query(
        `SELECT * FROM user
         WHERE user_id = ? OR email = ? OR phone = ?`,
        [username, username, username]
      );

      if (users.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "用户不存在"
        });
      }

      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      mockCodeStore[username] = {
        code: randomCode,
        expire: Date.now() + 5 * 60 * 1000
      };

      console.log(`【重置验证码】${username}：${randomCode}`);
      res.status(200).json({
        code: 200,
        message: "验证码已发送（查看后端控制台）"
      });
    } catch (err) {
      console.error("发送验证码错误：", err.message);
      res.status(500).json({
        code: 500,
        message: "服务器内部错误"
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { username, code, newPassword } = req.body;
      if (!username || !code || !newPassword) {
        return res.status(400).json({
          code: 400,
          message: "参数不能为空"
        });
      }

      const codeInfo = mockCodeStore[username];
      if (!codeInfo) return res.status(400).json({ code: 400, message: "请先获取验证码" });
      if (Date.now() > codeInfo.expire) {
        delete mockCodeStore[username];
        return res.status(400).json({ code: 400, message: "验证码已过期" });
      }
      if (codeInfo.code !== code) return res.status(400).json({ code: 400, message: "验证码错误" });
      if (newPassword.length < 6) return res.status(400).json({ code: 400, message: "新密码不少于6位" });

      const [result] = await pool.query(
        `UPDATE user
         SET password = ?, updated_at = NOW()
         WHERE user_id = ? OR email = ? OR phone = ?`,
        [newPassword, username, username, username]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          message: "用户不存在，更新失败"
        });
      }

      delete mockCodeStore[username];
      res.status(200).json({
        code: 200,
        message: "密码重置成功，请用新密码登录"
      });
    } catch (err) {
      console.error("重置密码错误：", err.message);
      res.status(500).json({
        code: 500,
        message: "服务器内部错误"
      });
    }
  }
}

const authController = new AuthController();
export default authController;
