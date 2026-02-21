const jwt = require('jsonwebtoken');

// Verifica el token JWT
function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Acceso denegado: token requerido' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
}

// Solo permite acceso a admins
function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado: se requiere rol admin' });
        }
        next();
    });
}

module.exports = { verifyToken, verifyAdmin };
