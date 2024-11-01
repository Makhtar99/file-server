const { pool } = require('../config/database');
const crypto = require('crypto');

class Share {
  static async create(fileId, expiresIn = '24h') {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));

    const query = `
      INSERT INTO shares (file_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [fileId, token, expiresAt]);
    return result.rows[0];
  }

  static async findByToken(token) {
    const query = `
      SELECT s.*, f.*
      FROM shares s
      JOIN files f ON s.file_id = f.id
      WHERE s.token = $1 AND s.expires_at > NOW()
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }
}

module.exports = Share;
