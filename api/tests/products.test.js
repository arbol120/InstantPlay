const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Product = require('../models/Product');

let userToken, adminToken;

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/gestor-productos-test');

    // Crear usuario normal
    await request(app).post('/api/auth/register')
        .send({ username: 'normaluser', password: 'password123' });
    const userLogin = await request(app).post('/api/auth/login')
        .send({ username: 'normaluser', password: 'password123' });
    userToken = userLogin.body.token;

    // Crear admin directamente en DB
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const adminUser = new User({
        username: 'adminuser',
        password: await bcrypt.hash('adminpass123', salt),
        role: 'admin'
    });
    await adminUser.save();
    const adminLogin = await request(app).post('/api/auth/login')
        .send({ username: 'adminuser', password: 'adminpass123' });
    adminToken = adminLogin.body.token;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    await Product.deleteMany({});
});

describe('PRODUCTS - CRUD', () => {
    test('Admin puede crear un producto', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Producto Test', price: 99.99, description: 'Desc' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('name', 'Producto Test');
    });

    test('Usuario normal NO puede crear producto', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ name: 'Producto Test', price: 50 });

        expect(res.status).toBe(403);
    });

    test('No debe crear producto sin nombre', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 50 });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });

    test('No debe crear producto con precio negativo', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Producto', price: -10 });

        expect(res.status).toBe(400);
    });

    test('Obtener productos con paginación', async () => {
        // Crear 3 productos
        for (let i = 1; i <= 3; i++) {
            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: `Producto ${i}`, price: i * 10 });
        }

        const res = await request(app)
            .get('/api/products?page=1&limit=2')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.products).toHaveLength(2);
        expect(res.body.pagination.total).toBe(3);
        expect(res.body.pagination.totalPages).toBe(2);
        expect(res.body.pagination.hasNextPage).toBe(true);
    });

    test('Filtrar productos por nombre', async () => {
        await request(app).post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Laptop Gaming', price: 1500 });
        await request(app).post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Mouse Gamer', price: 50 });

        const res = await request(app)
            .get('/api/products?name=laptop')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.products).toHaveLength(1);
        expect(res.body.products[0].name).toMatch(/laptop/i);
    });

    test('Admin puede eliminar producto', async () => {
        const created = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'A eliminar', price: 10 });

        const res = await request(app)
            .delete(`/api/products/${created.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/eliminado/i);
    });

    test('Sin token no puede acceder', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).toBe(401);
    });
});
