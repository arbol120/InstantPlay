const router = require('express').Router();
const Product = require('../models/Product');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validate');


router.get('/', verifyToken, async (req, res, next) => {
    try {
        const page     = Math.max(1, parseInt(req.query.page)  || 1);
        const limit    = Math.min(50, parseInt(req.query.limit) || 10);
        const skip     = (page - 1) * limit;

        // Construcción dinámica del filtro
        const filter = {};
        if (req.query.name)     filter.name     = { $regex: req.query.name, $options: 'i' };
        if (req.query.category) filter.category = { $regex: req.query.category, $options: 'i' };
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        const [products, total] = await Promise.all([
            Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Product.countDocuments(filter)
        ]);

        res.json({
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/:id
router.get('/:id', verifyToken, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(product);
    } catch (err) {
        next(err);
    }
});

// POST /api/products  — Solo admin
router.post('/', verifyAdmin, validateProduct, async (req, res, next) => {
    try {
        const { name, description, price, category } = req.body;
        const newProduct = new Product({ name, description, price, category });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        next(err);
    }
});

// PUT /api/products/:id  — Solo admin
router.put('/:id', verifyAdmin, validateProduct, async (req, res, next) => {
    try {
        const { name, description, price, category } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { name, description, price, category } },
            { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(updatedProduct);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/products/:id  — Solo admin
router.delete('/:id', verifyAdmin, async (req, res, next) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
