const validateRegister = (req, res, next) => {
    const { username, email, password } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Email invalide' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Mot de passe minimum 6 caractères' });
    }
    if (!username || username.length < 2) {
        return res.status(400).json({ message: 'Nom d\'utilisateur minimum 2 caractères' });
    }

    next();
};

const validateHabit = (req, res, next) => {
    const { title, type, period, color } = req.body;

    if (!title || title.length < 2) {
        return res.status(400).json({ message: 'Titre invalide' });
    }
    if (!['boolean', 'numeric'].includes(type)) {
        return res.status(400).json({ message: 'Type invalide (boolean ou numeric)' });
    }
    if (!['daily', 'weekly'].includes(period)) {
        return res.status(400).json({ message: 'Période invalide (daily ou weekly)' });
    }
    if (!color) {
        return res.status(400).json({ message: 'Couleur requise' });
    }

    // ✅ Validation du goal si présent
    if (req.body.goal !== undefined && req.body.goal !== null) {
        const goal = parseInt(req.body.goal, 10);
        if (isNaN(goal) || goal <= 0) {
            return res.status(400).json({ message: 'Goal doit être un nombre positif' });
        }
    }

    // ✅ Validation du type et période
    if (type === 'boolean' && period === 'daily' && req.body.goal !== undefined) {
        return res.status(400).json({ message: 'Les habitudes booléennes quotidiennes n\'ont pas besoin de goal' });
    }

    next();
};

const validateLog = (req, res, next) => {
    const { habitId, date, value } = req.body;

    if (!habitId) {
        return res.status(400).json({ message: 'habitId invalide' });
    }

    // ✅ Vérifier que habitId peut être converti en entier
    const habitIdInt = parseInt(habitId, 10);
    if (isNaN(habitIdInt) || habitIdInt <= 0) {
        return res.status(400).json({ message: 'habitId doit être un nombre positif' });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: 'Date invalide (YYYY-MM-DD)' });
    }

    if (typeof value !== 'number' || value < 0) {
        return res.status(400).json({ message: 'Value invalide (doit être un nombre >= 0)' });
    }

    next();
};

module.exports = { validateRegister, validateHabit, validateLog };