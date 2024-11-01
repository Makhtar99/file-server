const { pool } = require('../config/database');

class File {
  static async create({ userId, originalName, storagePath, mimeType, size, metadata }) {
    const query = `
      INSERT INTO files (user_id, original_name, storage_path, mime_type, size, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [userId, originalName, storagePath, mimeType, size, metadata];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async delete(id, userId) {
    const query = 'DELETE FROM files WHERE id = $1 AND user_id = $2 RETURNING *';
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  }
}

module.exports = File;
