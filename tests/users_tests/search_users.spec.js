const request = require('supertest');
let server =  require('../../server.js');

describe('Search Users Test Suite', () => {

    it('Keyword: "Ethan"', async() => { // first name
        let key = 'Ethan';
        const response = await request(server).get('/users/search/' + key);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({firstName: key})]));

    });

    it('Keyword: "Woollet"', async() => { // last name
        let key = 'Woollet';
        const response = await request(server).get('/users/search/' + key);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({lastName: key})]));

    });

    it('Keyword: "Ewool"', async() => { // username
        let key = 'Ewool';
        const response = await request(server).get('/users/search/' + key);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({username: key})]));

    });

    it('Keyword: "oo"', async() => {
        let key = 'oo';
        const response = await request(server).get('/users/search/' + key);

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