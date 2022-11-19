const request = require('supertest');
let server =  require('../server.js');

describe('Search Users Test Suite', () => {

    it('Test 1', async() => {
        const response = await request(server).get('/users/search/Ethan');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('1 user(s) found.');
        expect(response.body.results).not.toEqual([]);

    });
});