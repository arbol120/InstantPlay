// Valida los campos requeridos para crear/actualizar producto
function validateProduct(req, res, next) {
    const { name, price } = req.body;

    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push('El nombre es requerido y debe tener al menos 2 caracteres');
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
        errors.push('El precio es requerido y debe ser un número positivo');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Datos inválidos', errors });
    }

    next();
}

// Valida los campos requeridos para registro/login
function validateAuth(req, res, next) {
    const { username, password } = req.body;

    const errors = [];

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
        errors.push('Correo');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Datos inválidos', errors });
    }

    next();
}

module.exports = { validateProduct, validateAuth };
