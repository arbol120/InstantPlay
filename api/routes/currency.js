const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');

// GET /api/currency?amount=100&from=USD&to=MXN
// Usa la API gratuita de exchangerate-api.com
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const amount = parseFloat(req.query.amount) || 1;
        const from   = (req.query.from || 'USD').toUpperCase();
        const to     = (req.query.to   || 'MXN').toUpperCase();

        // API gratuita sin key (límite generoso para proyectos)
        const url = `https://api.exchangerate-api.com/v4/latest/${from}`;

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(502).json({ message: 'Error al consultar la API de divisas' });
        }

        const data = await response.json();

        if (!data.rates[to]) {
            return res.status(400).json({ message: `Divisa '${to}' no soportada` });
        }

        const rate = data.rates[to];
        const converted = (amount * rate).toFixed(2);

        res.json({
            from,
            to,
            amount,
            rate,
            converted: Number(converted),
            timestamp: data.time_last_updated
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/currency/rates?base=USD  — Lista todas las divisas disponibles
router.get('/rates', verifyToken, async (req, res, next) => {
    try {
        const base = (req.query.base || 'USD').toUpperCase();
        const url  = `https://api.exchangerate-api.com/v4/latest/${base}`;

        const response = await fetch(url);
        if (!response.ok) {
            return res.status(502).json({ message: 'Error al consultar la API de divisas' });
        }

        const data = await response.json();
        res.json({
            base: data.base,
            rates: data.rates,
            timestamp: data.time_last_updated
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
