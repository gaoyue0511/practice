import db from '../db/db.js';

class ColorLibraryService {
  async initTables() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS ai_generated_schemes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          colors TEXT NOT NULL,
          style_name VARCHAR(255) DEFAULT '智能配色',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS ai_scheme_collections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          scheme_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_scheme (user_id, scheme_id)
        )
      `);

      console.log('AI配色表初始化成功');
    } catch (err) {
      console.error('AI配色表初始化失败:', err.message);
    }
  }

  async getPublicColorSchemes() {
    const [rows] = await db.query(`
      SELECT id, title, description, colors, category, views
      FROM color_schemes
      WHERE is_public = 1
      ORDER BY created_at DESC
    `);

    return rows.map(item => ({
      ...item,
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors
    }));
  }

  async getSchemeDetail(id) {
    if (!id || isNaN(Number(id))) {
      throw new Error('参数错误：配色ID必须为数字');
    }

    const [rows] = await db.query(`
      SELECT * FROM color_schemes
      WHERE id = ? AND is_public = 1
    `, [id]);

    if (rows.length === 0) {
      throw new Error('该配色方案不存在或未公开');
    }

    await db.query(`UPDATE color_schemes SET views = views + 1 WHERE id = ?`, [id]);

    return {
      ...rows[0],
      colors: typeof rows[0].colors === 'string' ? JSON.parse(rows[0].colors) : rows[0].colors
    };
  }

  async toggleCollect(schemeId, userId, isCollect) {
    if (!schemeId || !userId || typeof isCollect !== 'boolean') {
      throw new Error('参数错误：schemeId、userId必传，isCollect必须为布尔值');
    }

    const [schemeRows] = await db.query(`SELECT id FROM color_schemes WHERE id = ?`, [schemeId]);
    if (schemeRows.length === 0) {
      throw new Error('该配色方案不存在');
    }

    const [collectRows] = await db.query(`
      SELECT id FROM color_scheme_collections
      WHERE user_id = ? AND scheme_id = ?
    `, [userId, schemeId]);

    if (isCollect) {
      if (collectRows.length === 0) {
        await db.query(`
          INSERT INTO color_scheme_collections (user_id, scheme_id, created_at)
          VALUES (?, ?, NOW())
        `, [userId, schemeId]);
      }
      return { message: '收藏成功' };
    } else {
      if (collectRows.length > 0) {
        await db.query(`
          DELETE FROM color_scheme_collections
          WHERE user_id = ? AND scheme_id = ?
        `, [userId, schemeId]);
      }
      return { message: '取消收藏成功' };
    }
  }

  async getUserCollections(userId) {
    if (!userId || isNaN(Number(userId))) {
      throw new Error('参数错误：userId必须为数字');
    }

    const [rows] = await db.query(`
      SELECT cs.id, cs.title, description, cs.colors, cs.category, cs.views
      FROM color_scheme_collections cc
      LEFT JOIN color_schemes cs ON cc.scheme_id = cs.id
      WHERE cc.user_id = ? AND cs.is_public = 1
      ORDER BY cc.created_at DESC
    `, [userId]);

    return rows.map(item => ({
      ...item,
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors
    }));
  }

  async saveAIGeneratedScheme(userId, schemeData) {
    if (!userId || !schemeData || !schemeData.colors) {
      throw new Error('参数错误：userId和schemeData.colors必传');
    }

    const [result] = await db.query(`
      INSERT INTO ai_generated_schemes (user_id, colors, style_name, created_at)
      VALUES (?, ?, ?, NOW())
    `, [userId, JSON.stringify(schemeData.colors), schemeData.styleName || '智能配色']);

    return { id: result.insertId, message: '保存成功' };
  }

  async toggleAICollect(userId, schemeId, isCollect) {
    if (!schemeId || !userId || typeof isCollect !== 'boolean') {
      throw new Error('参数错误：schemeId、userId必传，isCollect必须为布尔值');
    }

    const [schemeRows] = await db.query(`SELECT id FROM ai_generated_schemes WHERE id = ?`, [schemeId]);
    if (schemeRows.length === 0) {
      throw new Error('该配色方案不存在');
    }

    const [collectRows] = await db.query(`
      SELECT id FROM ai_scheme_collections
      WHERE user_id = ? AND scheme_id = ?
    `, [userId, schemeId]);

    if (isCollect) {
      if (collectRows.length === 0) {
        await db.query(`
          INSERT INTO ai_scheme_collections (user_id, scheme_id, created_at)
          VALUES (?, ?, NOW())
        `, [userId, schemeId]);
      }
      return { message: '收藏成功' };
    } else {
      if (collectRows.length > 0) {
        await db.query(`
          DELETE FROM ai_scheme_collections
          WHERE user_id = ? AND scheme_id = ?
        `, [userId, schemeId]);
      }
      return { message: '取消收藏成功' };
    }
  }

  async getAICollections(userId) {
    if (!userId || isNaN(Number(userId))) {
      throw new Error('参数错误：userId必须为数字');
    }

    const [rows] = await db.query(`
      SELECT ags.id, ags.colors, ags.style_name as category, ags.created_at
      FROM ai_scheme_collections ac
      LEFT JOIN ai_generated_schemes ags ON ac.scheme_id = ags.id
      WHERE ac.user_id = ?
      ORDER BY ac.created_at DESC
    `, [userId]);

    return rows.map(item => ({
      id: item.id,
      title: item.style_name || '智能配色',
      description: 'AI智能生成的配色方案',
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors,
      category: item.category || '智能配色',
      collectedAt: item.created_at
    }));
  }
}

const service = new ColorLibraryService();
service.initTables();

export default service;
