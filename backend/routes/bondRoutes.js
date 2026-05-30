// backend/routes/bondRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const { addBond, getBonds, updateBond, deleteBond } = require('../controllers/bondController');

router.post('/add',   auth, addBond);
router.get('/',       auth, getBonds);
router.put('/:id',    auth, updateBond);
router.delete('/:id', auth, deleteBond);

module.exports = router;