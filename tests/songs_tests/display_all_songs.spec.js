const request = require('supertest');
let server =  require('../../server.js');

describe('Display All Songs Test Suite', () => {

    it('Test 1', async() => {
        const response = await request(server).get('/songs');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No songs found.');
        expect(response.body.results).not.toEqual([]);

    });
});