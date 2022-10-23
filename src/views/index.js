

// Create connection to the database

// this is the connection string format for the Atlas cluster
// url = "mongodb+srv://<user>:<password>@ttcluster.fwv7kkt.mongodb.net/?retryWrites=true&w=majority"

const { MongoClient } = require("mongodb");
const url = "mongodb+srv://conn-master:Group23IsGoated@ttcluster.fwv7kkt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

run().catch(console.dir);


