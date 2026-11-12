import pool from '../db/db.js';

class UserService {
  // 获取用户信息
  async getUserProfile(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error('无效的用户ID');
    }

    const [rows] = await pool.execute(`
      SELECT id, user_id, email, phone, nickname, avatar, bio, status 
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (rows.length === 0) {
      throw new Error('用户不存在');
    }

    return rows[0];
  }

  // 更新用户信息
  async updateUserProfile(userId, updateData) {
    if (!userId || isNaN(userId)) {
      throw new Error('无效的用户ID');
    }

    const { nickname, email, phone, avatar, bio } = updateData;
    const updateFields = [];
    const params = [];

    if (nickname) { updateFields.push('nickname = ?'); params.push(nickname); }
    if (email) { updateFields.push('email = ?'); params.push(email); }
    if (phone) { updateFields.push('phone = ?'); params.push(phone); }
    if (avatar) { updateFields.push('avatar = ?'); params.push(avatar); }
    if (bio) { updateFields.push('bio = ?'); params.push(bio); }

    if (updateFields.length === 0) {
      throw new Error('无更新内容');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);

    await pool.execute(`
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `, params);

    return true;
  }
}

export default new UserService();