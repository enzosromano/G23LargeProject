const request = require('supertest');
let server =  require('../server.js');

describe('Search Users Test Suite', () => {

    it('Keyword: "Ethan"', async() => {
        const response = await request(server).get('/users/search/Ethan');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('No users found.');
        expect(response.body.results).not.toEqual([]);

    });

    it('Keyword: "Ewool"', async() => {
        const response = await request(server).get('/users/search/Ewool');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('1 user(s) found.');
        expect(response.body.results[0].username).toEqual("Ewool");

    });

    it('Keyword: "oo"', async() => {
        const response = await request(server).get('/users/search/oo');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({username:"Ewool"})]));

    });

    it('Keyword: "a"', async() => {
        const response = await request(server).get('/users/search/a');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).not.toEqual([]);

    });

    it('Keyword: "ZZZZZ"', async() => {
        const response = await request(server).get('/users/search/ZZZZZ');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('No users found.');
        expect(response.body.results).toEqual({}); // This should probably be changed to return `[]` ...

    });
});