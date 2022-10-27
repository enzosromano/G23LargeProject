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

  const { email, password, firstName, lastName } = req.body;

  //error handling for user input
  if (!email) {
    error = "User email required.";
    return res.status(400).json(error);
  } 
  else if (!firstName || !lastName) 
  {
    error = "First Name and Last Name are required fields.";
    return res.status(400).json(error);
  } 
  else if (!password) 
  {
    error = "Password is a required field.";
    return res.status(400).json(error);
  }


  (async () => {
    var ret = await addUser(email, password, firstName, lastName);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret.message);
    }

  })();
  
});

async function addUser(email, password, firstName, lastName) {
  const newUser = {
    userID: -1,
    firstName: firstName,
    lastName: lastName,
    email: email,
    isVerified: false,
    password: password,
    relationships: [],
  };

  var ret = {
    "success": false,
    "message": "",
    "results": {}
  }

  // establish db connection
  await client.connect();
  db = client.db("TuneTables");

  var exists = await db.collection("users").findOne({ email: email });

  if (!exists) {
    try {
      // The user doesn't already exist

      var count = await db.collection("counters").findOne({ _id: "userID" });

      //THIS ISNT WORKING I DONT GET THE COUNTERS DATABASE ):
      /*await db.collection("counters").insertOne({
        _id: "userID",
        seq: count.seq + 1,
      });*/
      //var count2 = await db.collection("counters").findOne({ _id: "userID" });
      //console.log("BP3");
      //console.log(`New counter: ${count2.seq}\n`);

      //Add the new user into the database
      await db.collection("users").insertOne({
        userID: count.seq + 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        isVerified: false,
        password: password,
        totalLikes: 0,
        relationships: [],
      });

      ret.success = true;
      ret.message = "Successfully added user.";
      ret.results = {
        "userID": count.seq + 1,
        "firstName": firstName,
        "lastName": lastName
      }

    } 
    catch 
    {
      ret.message = "Error occured while adding user";
    }
  }
  else
  {
    ret.message = "Please try a different email.";
  }

  await client.close();
  console.log(ret);
  return ret;

}

//#region User Login API Endpoint

app.options("/users/auth", (req, res) => {
  //Get the request body and grab user from it
  const { email, password } = req.body;

  (async () => {
    var ret = await loginAndValidate(email, password);

    res.status(200).json(ret);
  })();
});

async function loginAndValidate(userEmail, password) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  // create return
  var ret = {
    userID: -1,
    email: userEmail,
    password: password,
    error: "",
  };

  try {
    var user = await db.collection("users").findOne({ email: userEmail });

    pass = String(user.password);

    if (ret.password == pass) {
      ret.userID = user.userID;
    } else {
      ret.error = "Invalid username or password";
    }
  } catch {
    ret.error = "A user with this email address does not exist";
  }

  await client.close();
  return ret;
}

//#endregion
