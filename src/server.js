//const
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require("path");

//exports
module.exports = app;

//app properties
app.use(logger("tiny"));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(bodyParser.json());

//Mongo DB Variables
const { MongoClient } = require("mongodb");
const url =
  "mongodb+srv://conn-master:Group23IsGoated@ttcluster.fwv7kkt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);
//

//Connect to server and output when running
app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));
//

//Test function to see if database is working, runs below
//START TEST
async function run() {
  try {
    await client.connect();
    console.log("-- CONNECTION ESTABLISHED --\n\n");

    db = client.db("TuneTables");

    var counter1 = await db.collection("counters").findOne({ _id: "userID" });
    var user1 = await db.collection("users").findOne({ userID: 1 });
    var song1 = await db.collection("songs").findOne({ songID: 1 });

    console.log(`first counter: ${counter1.seq}\n`);
    console.log(`first user:    ${user1.firstName}\n`);
    console.log(`first song:    ${song1.title}\n`);

    // run the rest of the code
  } catch (err) {
    console.log(err.stack); // log error
  } finally {
    await client.close(); // end connection after process
  }
}

run().catch(console.dir); // read error log
//END TEST

//START USER VIEWS
//Initial load on home page, redirects user to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

//This is for the frontend to use when they make a second page. It will redirect to users.html which you can rename and edit
app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "users.html"));
});
//END USER VIEWS

app.post("/users", (req, res) => {
  const { userID, firstName, lastName, relationships } = req.body;

  const newUser = {
    UserID: userID,
    FirstName: firstName,
    LastName: lastName,
    Relationships: relationships,
  };

  var error = "";

  //Error Handling
  if (!newUser.UserID) {
    error = "User ID Invalid.";
    res.status(400).json(error);
  } else if (!newUser.FirstName || !newUser.LastName) {
    error = "firstName and lastName are required fields.";
    res.status(400).json(error);
  } else if (!newUser.Relationships) {
    error = "No relationships passed.";
    res.status(400).json(error);
  } else {
    res.status(200).json(newUser);
  }
});
