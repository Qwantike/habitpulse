const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, name, email) => {
    return jwt.sign({ id, name, email }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findByEmail(email);
        if (userExists) return res.status(400).json({ message: 'Email déjà utilisé' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = await User.create(username, email, hashedPassword);

        res.status(201).json({
            user: { id: userId.toString(), username, email },  // ✅ username au lieu de name
            token: generateToken(userId, username, email)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        res.json({
            user: { id: user.id.toString(), username: user.username, email: user.email },
            token: generateToken(user.id, user.username, user.email)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
