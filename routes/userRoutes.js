const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile,loginAdmin } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getProfile);
router.post('/admin/login', loginAdmin);
module.exports = router;