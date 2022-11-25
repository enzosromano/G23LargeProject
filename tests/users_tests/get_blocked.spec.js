const request = require('supertest');
let server =  require('../../server.js');


require('dotenv').config();
const url = process.env.MONGODB_URL;

const {MongoClient} = require('mongodb');

describe('Get Blocked Test Suite', () => {
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

    it('User exists and has blocked user(s)', async() => {

        let users = await db.collection('users');
        let ewool = await users.findOne({ username: 'Ewool'});
        let id = ewool._id.toString();
        let query = '/users/'+ id + '/blocked';

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual(expect.stringContaining('blocked user(s) found.'));
        expect(response.body.results).not.toEqual([]);

    });

    it('User exists and does not have blocked user(s)', async() => {

        let users = await db.collection('users');
        let azenn = await users.findOne({ username: 'Azenn'});
        let id = azenn._id.toString();
        let query = '/users/'+ id + '/blocked';

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('No blocked users found.');
        expect(response.body.results).toEqual([]);

    });

    it('User does not exist', async() => {

        let id = '12345';
        let query = '/users/'+ id + '/blocked';

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual(expect.stringContaining('No user found with id = ' + id));
        expect(response.body.results).toEqual([]);

    });

});