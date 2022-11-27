const request = require('supertest');
let server =  require('../../server.js');


require('dotenv').config();
const url = process.env.MONGODB_URL;

const {MongoClient} = require('mongodb');


describe('Search Users Test Suite', () => {

    let connection;
    let db;
    let id;

    beforeAll(async () => {
        // connect to database
        connection = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });

        db = await connection.db('TuneTables');
        let users = await db.collection('users');
        let ethan = await users.findOne({username: 'Azenn'});
        id = ethan._id;
    });

    afterAll(async () => {
        await connection.close();
    });

    it('Keyword: "Ethan"', async() => { // first name
        let key = 'Ethan';
        const response = await request(server).get('/users/' + id + '/search/' + key);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({firstName: key})]));

    });

    it('Keyword: "Woollet"', async() => { // last name
        let key = 'Woollet';
        const response = await request(server).get('/users/' + id + '/search/' + key);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({lastName: key})]));

    });

    it('Keyword: "Ewool"', async() => { // username
        let key = 'Ewool';
        const response = await request(server).get('/users/' + id + '/search/' + key);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({username: key})]));

    });

    it('Keyword: "oo"', async() => {
        let key = 'oo';
        const response = await request(server).get('/users/' + id + '/search/' + key);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({username:"Ewool"})]));

    });

    it('Keyword: "a"', async() => {
        const response = await request(server).get('/users/' + id + '/search/a');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).not.toEqual('No users found.');
        expect(response.body.results).not.toEqual([]);

    });

    it('Keyword: "ZZZZZ"', async() => {
        const response = await request(server).get('/users/' + id + '/search/ZZZZZ');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('No users found.');
        expect(response.body.results).toEqual({}); // This should probably be changed to return `[]` ...

    });
});