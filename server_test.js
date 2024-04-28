const request = require('supertest');
const app = require('./app');

// Test for API endpoints
describe('API endpoints', () => {
    test('GET /api/current should return data', async () => {
        const res = await request(app).get('/api/current');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
    });

    test('GET /api/sample should return data based on count', async () => {
        const res = await request(app).get('/api/sample?count=10');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
    });
});
