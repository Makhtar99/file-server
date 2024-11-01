const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../config/database');

router.post('/', async (req, res) => {
  try {
    const { fileId, expiresIn } = req.body;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const query = `
      INSERT INTO shares (file_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [fileId, token, expiresAt]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:token', async (req, res) => {
  try {
    const query = `
      SELECT f.*, s.expires_at
      FROM shares s
      JOIN files f ON f.id = s.file_id
      WHERE s.token = $1 AND s.expires_at > NOW()
    `;
    const { rows } = await pool.query(query, [req.params.token]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Share not found or expired' });
    }

    const file = rows[0];
    res.download(
      `uploads/${file.storage_path}`,
      file.original_name,
      { headers: { 'Content-Type': file.mime_type } }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
