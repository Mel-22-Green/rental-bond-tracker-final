// backend/controllers/authController.js
const pool      = require('../config/db');
const md5       = require('md5');
const jwt       = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode    = require('qrcode');
const crypto    = require('crypto');

const hashCode = (c) => crypto.createHash('sha256').update(c).digest('hex');
const generateBackupCodes = () =>
  Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());

// ── POST /api/auth/register ────────────────────────────────────────────────
// Creates account, generates TOTP secret, returns QR code + backup codes.
// No JWT yet — user must complete MFA setup first.
const register = async (req, res) => {
  const { full_name, email, password, phone } = req.body;
  if (!full_name || !email || !password)
    return res.status(400).json({ error: 'full_name, email and password are required' });
  try {
    if ((await pool.query('SELECT 1 FROM users WHERE email=$1', [email])).rows.length)
      return res.status(400).json({ error: 'Email already registered' });

    const secret = speakeasy.generateSecret({
      name: `RentalBondTracker (${email})`, issuer: 'RentalBondTracker',
    });

    const { rows } = await pool.query(
      `INSERT INTO users (full_name,email,password,phone,two_factor_secret,two_factor_enabled)
       VALUES ($1,$2,$3,$4,$5,FALSE)
       RETURNING user_id,full_name,email,phone,role`,
      [full_name, email, md5(password), phone || null, secret.base32]
    );
    const user = rows[0];

    const plainCodes = generateBackupCodes();
    await Promise.all(plainCodes.map(c =>
      pool.query('INSERT INTO backup_codes (user_id,code_hash) VALUES ($1,$2)',
        [user.user_id, hashCode(c)])
    ));

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'CREATE','Users','User registered — MFA pending',$2)`,
      [user.user_id, req.ip]
    );

    res.status(201).json({
      message: 'Account created. Scan the QR code in your authenticator app, then enter the code to complete setup.',
      user_id: user.user_id,
      qrDataUrl,
      backupCodes: plainCodes,
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/auth/mfa/setup-verify ────────────────────────────────────────
// Called after registration: verifies TOTP, enables MFA, issues full JWT.
const mfaSetupVerify = async (req, res) => {
  const { user_id, token } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id=$1', [user_id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const user = rows[0];

    const ok = speakeasy.totp.verify({
      secret: user.two_factor_secret, encoding: 'base32', token, window: 1,
    });
    if (!ok) return res.status(400).json({ error: 'Invalid code. Try again.' });

    await pool.query(
      'UPDATE users SET two_factor_enabled=TRUE,last_login=NOW() WHERE user_id=$1', [user_id]
    );
    const jwtToken = jwt.sign(
      { user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' }
    );
    res.json({
      token: jwtToken,
      user: { user_id: user.user_id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('MFA SETUP VERIFY ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────
// Validates password. Returns { mfa_required: true, pre_token } or full token.
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email=$1 AND password=$2', [email, md5(password)]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });
    const user = rows[0];

    if (user.two_factor_enabled) {
      const preToken = jwt.sign(
        { user_id: user.user_id, pre_mfa: true }, process.env.JWT_SECRET, { expiresIn: '5m' }
      );
      return res.json({ mfa_required: true, pre_token: preToken });
    }

    // Edge case: MFA not yet enabled
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' }
    );
    await pool.query('UPDATE users SET last_login=NOW() WHERE user_id=$1', [user.user_id]);
    res.json({
      mfa_required: false, token,
      user: { user_id: user.user_id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/auth/mfa/login-verify ───────────────────────────────────────
// Verifies TOTP during login flow, issues full JWT.
const mfaLoginVerify = async (req, res) => {
  const { pre_token, token: totpToken } = req.body;
  try {
    let decoded;
    try { decoded = jwt.verify(pre_token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ error: 'Session expired. Please log in again.' }); }
    if (!decoded.pre_mfa) return res.status(401).json({ error: 'Invalid session' });

    const { rows } = await pool.query('SELECT * FROM users WHERE user_id=$1', [decoded.user_id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const user = rows[0];

    const ok = speakeasy.totp.verify({
      secret: user.two_factor_secret, encoding: 'base32', token: totpToken, window: 1,
    });
    if (!ok) return res.status(400).json({ error: 'Invalid MFA code' });

    const fullToken = jwt.sign(
      { user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' }
    );
    await pool.query('UPDATE users SET last_login=NOW() WHERE user_id=$1', [user.user_id]);
    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'LOGIN','Authentication','Logged in successfully',$2)`,
      [user.user_id, req.ip]
    );
    res.json({
      token: fullToken,
      user: { user_id: user.user_id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('MFA LOGIN VERIFY ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/auth/mfa/backup-verify ──────────────────────────────────────
const mfaBackupVerify = async (req, res) => {
  const { pre_token, backup_code } = req.body;
  try {
    let decoded;
    try { decoded = jwt.verify(pre_token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ error: 'Session expired' }); }

    const h = hashCode(backup_code.toUpperCase().replace(/\s/g, ''));
    const { rows } = await pool.query(
      'SELECT * FROM backup_codes WHERE user_id=$1 AND code_hash=$2 AND used=FALSE',
      [decoded.user_id, h]
    );
    if (!rows.length) return res.status(400).json({ error: 'Invalid or already-used backup code' });

    await pool.query('UPDATE backup_codes SET used=TRUE WHERE id=$1', [rows[0].id]);
    const user = (await pool.query('SELECT * FROM users WHERE user_id=$1', [decoded.user_id])).rows[0];

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' }
    );
    await pool.query('UPDATE users SET last_login=NOW() WHERE user_id=$1', [user.user_id]);
    res.json({
      token,
      user: { user_id: user.user_id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('BACKUP VERIFY ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────
const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const r = await pool.query(
      'UPDATE users SET password=$1 WHERE email=$2 RETURNING user_id', [md5(newPassword), email]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Email not found' });
    res.json({ message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── GET /api/auth/backup-codes  (requires full JWT) ───────────────────────
const getBackupCodes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,used,created_at FROM backup_codes WHERE user_id=$1 ORDER BY id',
      [req.user.user_id]
    );
    res.json({ backup_codes: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── POST /api/auth/backup-codes/regenerate ────────────────────────────────
const regenerateBackupCodes = async (req, res) => {
  try {
    await pool.query('DELETE FROM backup_codes WHERE user_id=$1', [req.user.user_id]);
    const plainCodes = generateBackupCodes();
    await Promise.all(plainCodes.map(c =>
      pool.query('INSERT INTO backup_codes (user_id,code_hash) VALUES ($1,$2)',
        [req.user.user_id, hashCode(c)])
    ));
    res.json({ backup_codes: plainCodes });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── DELETE /api/auth/account ───────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  const { password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id=$1', [req.user.user_id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    if (rows[0].password !== md5(password))
      return res.status(400).json({ error: 'Incorrect password' });
    await pool.query('DELETE FROM users WHERE user_id=$1', [req.user.user_id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = {
  register, mfaSetupVerify, login, mfaLoginVerify, mfaBackupVerify,
  forgotPassword, getBackupCodes, regenerateBackupCodes, deleteAccount,
};
