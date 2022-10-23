

// Create connection to the database

// this is the connection string format for the Atlas cluster
// url = "mongodb+srv://<user>:<password>@ttcluster.fwv7kkt.mongodb.net/?retryWrites=true&w=majority"

const { MongoClient } = require("mongodb");
const url = "mongodb+srv://conn-master:Group23IsGoated@ttcluster.fwv7kkt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("-- CONNECTION ESTABLISHED --\n\n");

        db = client.db('TuneTables')

        var counter1 = await db.collection('counters').findOne({_id : "userID"});
        var user1 = await db.collection('users').findOne({userID : 1});
        var song1 = await db.collection('songs').findOne({songID : 1});

        console.log(`first counter: ${counter1.seq}\n`)
        console.log(`first user:    ${user1.firstName}\n`)
        console.log(`first song:    ${song1.title}\n`)

        // run the rest of the code



    } catch (err) {
        console.log(err.stack);// log error
    }
    finally {
        await client.close(); // end connection after process
    }
}

run().catch(console.dir); // read error log
