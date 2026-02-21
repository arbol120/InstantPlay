const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateAuth } = require('../middleware/validate');

// Registro
router.post('/register', validateAuth, async (req, res, next) => {
    try {
        const { username, password, role } = req.body;

        const userExist = await User.findOne({ username });
        if (userExist) return res.status(400).json({ message: 'El usuario ya existe' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Solo se permite asignar rol admin si se manda la clave secreta de admin
        const assignedRole = (role === 'admin' && req.body.adminSecret === process.env.ADMIN_SECRET)
            ? 'admin'
            : 'user';

        const newUser = new User({ username, password: hashedPassword, role: assignedRole });
        const savedUser = await newUser.save();

        res.status(201).json({
            userId: savedUser._id,
            username: savedUser.username,
            role: savedUser.role
        });
    } catch (err) {
        next(err);
    }
});

// Login
router.post('/login', validateAuth, async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { _id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ token, role: user.role, username: user.username });
    } catch (err) {
        next(err);
    }
});

// Obtener perfil propio
router.get('/profile', require('../middleware/auth').verifyToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
