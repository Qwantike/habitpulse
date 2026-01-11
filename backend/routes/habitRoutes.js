const express = require('express');
const router = express.Router();
const { getHabits, createHabit, deleteHabit, getLogs, logHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');
const { validateHabit, validateLog } = require('../middleware/validators');

// Logs routes (avant les routes paramétrées)
router.get('/logs', protect, getLogs);
router.post('/logs', protect, validateLog, logHabit);

// Habits routes
router.get('/', protect, getHabits);
router.post('/', protect, validateHabit, createHabit);
router.delete('/:id', protect, deleteHabit);

module.exports = router;
