// backend/routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  register, mfaSetupVerify, login, mfaLoginVerify, mfaBackupVerify,
  forgotPassword, getBackupCodes, regenerateBackupCodes, deleteAccount,
} = require('../controllers/authController');

// Public
router.post('/register',              register);
router.post('/login',                 login);
router.post('/forgot-password',       forgotPassword);
router.post('/mfa/setup-verify',      mfaSetupVerify);
router.post('/mfa/login-verify',      mfaLoginVerify);
router.post('/mfa/backup-verify',     mfaBackupVerify);

// Authenticated
router.get('/backup-codes',                    authMiddleware, getBackupCodes);
router.post('/backup-codes/regenerate',        authMiddleware, regenerateBackupCodes);
router.delete('/account',                      authMiddleware, deleteAccount);

module.exports = router;
