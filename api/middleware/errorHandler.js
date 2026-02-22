// Middleware global de manejo de errores
function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.error(err.stack);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Error de validación',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Ya existe un registro con ese valor' });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token inválido' });
    }

    // Error genérico
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor'
    });
}

// Middleware para rutas no encontradas
function notFound(req, res, next) {
    res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFound };
