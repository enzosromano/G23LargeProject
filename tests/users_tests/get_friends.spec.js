const request = require('supertest');
let server =  require('../../server.js');


require('dotenv').config();
const url = process.env.MONGODB_URL;

const {MongoClient} = require('mongodb');

describe('Get Friends Test Suite', () => {
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

    it('User exists and has friends(s)', async() => {

        let users = await db.collection('users');
        let ewool = await users.findOne({ username: 'Ewool'});
        let id = ewool._id.toString();
        let query = '/users/'+ id + '/friends';

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual(expect.stringContaining('friend(s) found.'));
        expect(response.body.results).not.toEqual([]);

    });

    it('User exists and does not have friend(s)', async() => {

        let users = await db.collection('users');
        let azenn = await users.findOne({ username: 'Azenn'});
        let id = azenn._id.toString();
        let query = '/users/'+ id + '/friends';

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('No friends found.');
        expect(response.body.results).toEqual([]);

    });

    it('User does not exist', async() => {

        let id = '12345';
        let query = '/users/'+ id + '/friends';

        const response = await request(server).get(query);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.message).toEqual('No user found with id = ' + id);
        expect(response.body.results).toEqual([]);

    });

});