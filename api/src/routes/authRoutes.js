import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
        
        const existingUser = await User.findOne({ userName: username });
        if (existingUser) return res.status(400).json({ error: 'Username already taken' });
        
        const user = new User({ userName: username, password });
        await user.save();
        
        const token = user.generateJWT();
        res.status(201).json({ user: user.userName, token });
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ userName: username });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: 'Password Incorrect, be better' });

        const token = user.generateJWT();
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ error: 'Authorization header missing' });
        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;