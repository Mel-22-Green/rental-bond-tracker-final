// backend/routes/propertyRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const { addProperty, getProperties, updateProperty, deleteProperty } =
  require('../controllers/propertycontroller');

router.post('/add',   auth, addProperty);
router.get('/',       auth, getProperties);
router.put('/:id',    auth, updateProperty);
router.delete('/:id', auth, deleteProperty);

module.exports = router;