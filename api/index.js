require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const currencyRoutes = require('./routes/currency');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});


app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/currency', currencyRoutes);


app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use(notFound);
app.use(errorHandler);


if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestor-productos')
        .then(() => console.log('✅ Conectado a MongoDB'))
        .catch(err => console.error('❌ Error MongoDB:', err));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}

module.exports = app;
