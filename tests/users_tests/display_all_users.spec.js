const request = require('supertest');
let server =  require('../../server.js');

describe('Display All Users Test Suite', () => {

    it('Test 1', async() => {
        const response = await request(server).get('/users');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).not.toEqual([]);

    });
});