const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');

// Base de datos en memoria para tests
await mongoose.connect('mongodb://localhost:27017/gestor-productos-test');
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('AUTH - Registro', () => {
    test('Debe registrar un usuario correctamente', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'testuser', password: 'password123' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('username', 'testuser');
        expect(res.body).toHaveProperty('role', 'user');
    });

    test('No debe registrar con username duplicado', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ username: 'testuser', password: 'password123' });

        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'testuser', password: 'otrapass123' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/ya existe/i);
    });

    test('No debe registrar con datos inválidos (password corta)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'user', password: '123' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });

    test('No debe registrar con username menor a 3 caracteres', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'ab', password: 'password123' });

        expect(res.status).toBe(400);
    });
});

describe('AUTH - Login', () => {
    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ username: 'loginuser', password: 'password123' });
    });

    test('Debe hacer login y devolver token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'loginuser', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('role');
    });

    test('No debe login con contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'loginuser', password: 'wrongpassword' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/contraseña/i);
    });

    test('No debe login con usuario inexistente', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'noexiste', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/no encontrado/i);
    });
});
