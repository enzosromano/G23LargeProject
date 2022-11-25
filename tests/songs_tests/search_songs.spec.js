const request = require('supertest');
let server =  require('../../server.js');

describe('Search Songs Test Suite', () => {
    
    it('Keyword: "Respeck"', async() => { // keyword shouldn't exist
        const response = await request(server).get('/songs/search/Respeck');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('No songs found.');
        expect(response.body.results).not.toEqual([]);

    });

    it('Keyword: "Respect"', async() => { // checking title
        const response = await request(server).get('/songs/search/Respect');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('1 song(s) found.');
        expect(response.body.results[0].title).toEqual("Respect");

    });

    it('Keyword: "Aretha Franklin"', async() => { // checking artist
        const response = await request(server).get('/songs/search/Aretha Franklin');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('1 song(s) found.');
        expect(response.body.results[0].artist).toEqual("Aretha Franklin");

    });

    it('Keyword: "I Never Loved a Man the Way I Love You"', async() => { // checking album
        const response = await request(server).get('/songs/search/I Never Loved a Man the Way I Love You');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No songs found.');
        expect(response.body.results[0].album).toEqual("I Never Loved a Man the Way I Love You");

    });

    it('Keyword: "ec"', async() => {
        const response = await request(server).get('/songs/search/ec');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('1 song(s) found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({title:"Respect"})]));

    });

    it('Keyword: "ZZZZZ"', async() => {
        const response = await request(server).get('/songs/search/ZZZZZ');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('No songs found.');
        expect(response.body.results).toEqual({}); // This should probably be changed to return `[]` ...

    });
    
});