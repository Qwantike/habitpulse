// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister } = require('../middleware/validators');

router.post('/register', validateRegister, register);
router.post('/login', login);

// Endpoint /me protégé
router.get('/me', protect, async (req, res) => {
    // req.user contient { id, name, email } depuis le token
    res.json({
        id: req.user.id,
        username: req.user.name,
        email: req.user.email,
    });
});

module.exports = router;
