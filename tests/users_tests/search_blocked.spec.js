const request = require('supertest');
let server =  require('../../server.js');


require('dotenv').config();
const url = process.env.MONGODB_URL;

const {MongoClient} = require('mongodb');

describe('Search Blocked Users Test Suite', () => {
    let connection;
    let db;

    beforeAll(async () => {
        // connect to database
        connection = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });

        db = await connection.db('TuneTables');
    });

    afterAll(async () => {
        await connection.close();
    });

    it('User exists and has friend with full string matching', async() => {

        let keyword = 'Hster';

        let users = await db.collection('users');
        let ewool = await users.findOne({ username: 'Ewool'});
        let id = ewool._id.toString();
        let query = '/users/'+ id + '/searchBlocked/' + keyword;

        const response = await request(server).get(query);

        let azenn = await users.findOne({ username: 'Hster'});
        let fid = azenn._id.toString();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual(expect.stringContaining('1 blocked user(s) found with keyword'));
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({_id: fid})]));

    });

    it('User exists and has friend with partial string matching', async() => {

        let keyword = 'ee';

        let users = await db.collection('users');
        let ewool = await users.findOne({ username: 'Ewool'});
        let id = ewool._id.toString();
        let query = '/users/'+ id + '/searchBlocked/' + keyword;

        const response = await request(server).get(query);

        let azenn = await users.findOne({ username: 'Mnees'});
        let fid = azenn._id.toString();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual(expect.stringContaining('1 blocked user(s) found with keyword'));
        expect(response.body.results).toEqual(expect.arrayContaining([expect.objectContaining({_id: fid})]));

    });

    it('User exists and has friend with no string matching', async() => {

        let keyword = 'A';

        let users = await db.collection('users');
        let ewool = await users.findOne({ username: 'Ewool'});
        let id = ewool._id.toString();
        let query = '/users/'+ id + '/searchBlocked/' + keyword;

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual(expect.stringContaining('0 blocked user(s) found with keyword'));
        expect(response.body.results).toEqual([]);

    });

    it('User exists and does not have friend(s)', async() => {

        let users = await db.collection('users');
        let azenn = await users.findOne({ username: 'Azenn'});
        let id = azenn._id.toString();
        let query = '/users/'+ id + '/searchBlocked/' + 'a';

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual(expect.stringContaining('0 blocked user(s) found with keyword'));
        expect(response.body.results).toEqual([]);

    });

    it('User does not exist', async() => {

        let id = '12345';
        let query = '/users/'+ id + '/searchBlocked/' + 'a';

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual(expect.stringContaining('No user found with id'));
        expect(response.body.results).toEqual([]);

    });

});