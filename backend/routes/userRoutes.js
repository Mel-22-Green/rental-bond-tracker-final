// backend/routes/userRoutes.js
const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const md5     = require('md5');
const auth    = require('../middleware/authMiddleware');

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  const { full_name, phone } = req.body;
  try {
    const r = await pool.query(
      'UPDATE users SET full_name=$1, phone=$2 WHERE user_id=$3 RETURNING user_id,full_name,email,phone,role',
      [full_name, phone || null, req.user.user_id]
    );
    res.json({ user: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/change-password
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  try {
    const r = await pool.query('SELECT password FROM users WHERE user_id=$1', [req.user.user_id]);
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    if (r.rows[0].password !== md5(currentPassword))
      return res.status(400).json({ error: 'Current password is incorrect' });
    await pool.query('UPDATE users SET password=$1 WHERE user_id=$2', [md5(newPassword), req.user.user_id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;