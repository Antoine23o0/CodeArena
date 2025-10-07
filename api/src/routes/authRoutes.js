import router from "express.Router()";
import User from "../models/user.js";

// Signin route
router.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = user.generateJWT();
        res.status(201).json({user: user.userName, token});
    } catch (err) {
        res.status(400).jason({error: err.message});
    }

});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: 'Mot de passe incorrect' });

        const token = user.generateJWT();
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;