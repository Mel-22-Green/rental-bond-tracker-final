// backend/routes/adminRoutes.js  — FULL REPLACEMENT
const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// ── guard ─────────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  next();
};
const guard = [authMiddleware, adminOnly];

// ── pagination helper ─────────────────────────────────────────────────────────
function pg(page, limit) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { limit: l, offset: (p - 1) * l };
}

// ══════════════════════════════════════════════════════════════════════════════
// LEGACY — kept for backward compat
// ══════════════════════════════════════════════════════════════════════════════
router.get('/dashboard', guard, async (req, res) => {
  try {
    const [users, properties, bonds, inspections, documents] = await Promise.all([
      pool.query('SELECT user_id,full_name,email,phone,role,created_at FROM users ORDER BY created_at DESC LIMIT 50'),
      pool.query(`SELECT p.*,u.full_name AS owner_name FROM properties p LEFT JOIN users u ON p.user_id=u.user_id ORDER BY p.created_at DESC LIMIT 50`),
      pool.query(`SELECT b.*,p.address,u.full_name AS tenant_name FROM bonds b LEFT JOIN properties p ON b.property_id=p.property_id LEFT JOIN users u ON b.user_id=u.user_id ORDER BY b.created_at DESC LIMIT 50`),
      pool.query(`SELECT i.*,p.address,u.full_name AS tenant_name FROM inspections i LEFT JOIN properties p ON i.property_id=p.property_id LEFT JOIN users u ON i.user_id=u.user_id ORDER BY i.created_at DESC LIMIT 50`),
      pool.query('SELECT * FROM documents ORDER BY created_at DESC LIMIT 50'),
    ]);
    res.json({ users:users.rows, properties:properties.rows, bonds:bonds.rows, inspections:inspections.rows, documents:documents.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// STATS  GET /api/admin/stats
// ══════════════════════════════════════════════════════════════════════════════
router.get('/stats', guard, async (req, res) => {
  try {
    const [u, p, b, i, d, logs] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM properties'),
      pool.query('SELECT COUNT(*) FROM bonds'),
      pool.query('SELECT COUNT(*) FROM inspections'),
      pool.query('SELECT COUNT(*) FROM documents'),
      pool.query(`
        SELECT al.*, u.email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.user_id
        ORDER BY al.created_at DESC LIMIT 5`),
    ]);
    res.json({
      stats: {
        users:       parseInt(u.rows[0].count),
        properties:  parseInt(p.rows[0].count),
        bonds:       parseInt(b.rows[0].count),
        inspections: parseInt(i.rows[0].count),
        documents:   parseInt(d.rows[0].count),
      },
      recentActivity: logs.rows,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════════════════════
router.get('/users', guard, async (req, res) => {
  try {
    const { page, limit, search = '', role } = req.query;
    const { limit: lim, offset } = pg(page, limit);
    const conds = []; const vals = []; let idx = 1;

    if (search) { conds.push(`(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx})`); vals.push(`%${search}%`); idx++; }
    if (role && role !== 'All') { conds.push(`u.role = $${idx}`); vals.push(role.toLowerCase()); idx++; }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const [cnt, data] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users u ${where}`, vals),
      pool.query(`SELECT u.user_id,u.full_name,u.email,u.phone,u.role,u.created_at,u.last_login FROM users u ${where} ORDER BY u.created_at DESC LIMIT $${idx} OFFSET $${idx+1}`, [...vals, lim, offset]),
    ]);
    res.json({ users: data.rows, total: parseInt(cnt.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/users/:id', guard, async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, role } = req.body;
  try {
    const r = await pool.query(
      `UPDATE users SET full_name=COALESCE($1,full_name), email=COALESCE($2,email), phone=COALESCE($3,phone), role=COALESCE($4,role) WHERE user_id=$5 RETURNING user_id,full_name,email,phone,role`,
      [full_name, email, phone, role, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/users/:id/reset-password', guard, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  const md5 = require('md5');
  try {
    await pool.query('UPDATE users SET password=$1 WHERE user_id=$2', [md5(password), id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', guard, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE user_id=$1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// PROPERTIES
// ══════════════════════════════════════════════════════════════════════════════
router.get('/properties', guard, async (req, res) => {
  try {
    const { page, limit, search = '' } = req.query;
    const { limit: lim, offset } = pg(page, limit);
    const conds = []; const vals = []; let idx = 1;

    if (search) { conds.push(`(p.address ILIKE $${idx} OR u.full_name ILIKE $${idx})`); vals.push(`%${search}%`); idx++; }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const [cnt, data] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM properties p LEFT JOIN users u ON p.user_id=u.user_id ${where}`, vals),
      pool.query(`SELECT p.*,u.full_name AS owner_name FROM properties p LEFT JOIN users u ON p.user_id=u.user_id ${where} ORDER BY p.created_at DESC NULLS LAST LIMIT $${idx} OFFSET $${idx+1}`, [...vals, lim, offset]),
    ]);
    res.json({ properties: data.rows, total: parseInt(cnt.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/properties/:id', guard, async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE property_id=$1', [req.params.id]);
    res.json({ message: 'Property deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// BONDS
// ══════════════════════════════════════════════════════════════════════════════
router.get('/bonds', guard, async (req, res) => {
  try {
    const { page, limit, status, property_id } = req.query;
    const { limit: lim, offset } = pg(page, limit);
    const conds = []; const vals = []; let idx = 1;

    if (status && status !== 'All') { conds.push(`LOWER(b.status)=LOWER($${idx})`); vals.push(status); idx++; }
    if (property_id) { conds.push(`b.property_id=$${idx}`); vals.push(property_id); idx++; }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const [cnt, data] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM bonds b ${where}`, vals),
      pool.query(`
        SELECT b.*,p.address,u.full_name AS tenant_name
        FROM bonds b
        LEFT JOIN properties p ON b.property_id=p.property_id
        LEFT JOIN users u ON b.user_id=u.user_id
        ${where}
        ORDER BY b.created_at DESC NULLS LAST
        LIMIT $${idx} OFFSET $${idx+1}`, [...vals, lim, offset]),
    ]);
    res.json({ bonds: data.rows, total: parseInt(cnt.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/bonds/:id/status', guard, async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending','paid','refunded'];
  if (!allowed.includes((status||'').toLowerCase()))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    await pool.query('UPDATE bonds SET status=$1 WHERE bond_id=$2', [status, req.params.id]);
    res.json({ message: 'Bond status updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/bonds/:id/refund', guard, async (req, res) => {
  const { amount, date } = req.body;
  if (!amount) return res.status(400).json({ error: 'Refund amount required' });
  try {
    await pool.query(
      `UPDATE bonds SET status='refunded', refund_amount=$1, refund_date=$2 WHERE bond_id=$3`,
      [amount, date || new Date(), req.params.id]
    );
    res.json({ message: 'Refund processed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS  ← was missing entirely
// ══════════════════════════════════════════════════════════════════════════════
router.get('/documents', guard, async (req, res) => {
  try {
    const { page, limit, search = '' } = req.query;
    const { limit: lim, offset } = pg(page, limit);
    const conds = []; const vals = []; let idx = 1;

    if (search) { conds.push(`(d.title ILIKE $${idx} OR u.full_name ILIKE $${idx})`); vals.push(`%${search}%`); idx++; }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const [cnt, data] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM documents d LEFT JOIN users u ON d.user_id=u.user_id ${where}`, vals),
      pool.query(`
        SELECT d.*,u.full_name AS owner_name,u.email AS owner_email
        FROM documents d
        LEFT JOIN users u ON d.user_id=u.user_id
        ${where}
        ORDER BY d.created_at DESC NULLS LAST
        LIMIT $${idx} OFFSET $${idx+1}`, [...vals, lim, offset]),
    ]);
    res.json({ documents: data.rows, total: parseInt(cnt.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/documents/:id', guard, async (req, res) => {
  const path = require('path');
  const fs   = require('fs');
  try {
    const r = await pool.query('SELECT file_path FROM documents WHERE document_id=$1', [req.params.id]);
    if (r.rows[0]?.file_path) {
      const fp = path.join(__dirname, '..', r.rows[0].file_path);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await pool.query('DELETE FROM documents WHERE document_id=$1', [req.params.id]);
    res.json({ message: 'Document deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// INSPECTIONS
// ══════════════════════════════════════════════════════════════════════════════
router.get('/inspections', guard, async (req, res) => {
  try {
    const { page, limit, type } = req.query;
    const { limit: lim, offset } = pg(page, limit);
    const conds = []; const vals = []; let idx = 1;

    if (type && type !== 'All') { conds.push(`LOWER(i.inspection_type)=LOWER($${idx})`); vals.push(type); idx++; }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const [cnt, data] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM inspections i ${where}`, vals),
      pool.query(`
        SELECT i.*,p.address,u.full_name AS tenant_name
        FROM inspections i
        LEFT JOIN properties p ON i.property_id=p.property_id
        LEFT JOIN users u ON i.user_id=u.user_id
        ${where}
        ORDER BY i.created_at DESC NULLS LAST
        LIMIT $${idx} OFFSET $${idx+1}`, [...vals, lim, offset]),
    ]);
    res.json({ inspections: data.rows, total: parseInt(cnt.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS  ← was missing entirely
// ══════════════════════════════════════════════════════════════════════════════
router.get('/audit', guard, async (req, res) => {
  try {
    const { page, limit, search = '', action, export: exp } = req.query;
    const isExport = exp === 'csv';
    const { limit: lim, offset } = isExport ? { limit: 10000, offset: 0 } : pg(page, limit);

    const conds = []; const vals = []; let idx = 1;

    if (search) { conds.push(`(u.email ILIKE $${idx} OR al.description ILIKE $${idx})`); vals.push(`%${search}%`); idx++; }
    if (action && action !== 'All') { conds.push(`al.action_type = $${idx}`); vals.push(action.toUpperCase()); idx++; }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const [cnt, data] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM audit_logs al LEFT JOIN users u ON al.user_id=u.user_id ${where}`, vals),
      pool.query(`
        SELECT al.*,u.email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id=u.user_id
        ${where}
        ORDER BY al.created_at DESC
        LIMIT $${idx} OFFSET $${idx+1}`, [...vals, lim, offset]),
    ]);
    res.json({ logs: data.rows, total: parseInt(cnt.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;