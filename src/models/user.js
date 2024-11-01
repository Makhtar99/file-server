const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create({ email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, password, storage_used, quota_limit)
      VALUES ($1, $2, 0, $3)
      RETURNING id, email, storage_used, quota_limit
    `;
    const values = [email, hashedPassword, 2 * 1024 * 1024 * 1024]; // 2GB default quota
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(userId) {
    const query = 'SELECT id, email, storage_used, quota_limit FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  static async updateStorageUsed(userId, size) {
    const query = `
      UPDATE users
      SET storage_used = storage_used + $2
      WHERE id = $1
      RETURNING storage_used, quota_limit
    `;
    const { rows } = await pool.query(query, [userId, size]);
    return rows[0];
  }
}

module.exports = User;
