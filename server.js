//const
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require("path");
const PORT = process.env.PORT || 5000;
const app = express();

//exports
module.exports = app;

//app properties
app.set('port', (process.env.PORT || 5000));
app.use(logger("tiny"));
// app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(bodyParser.json());

// Server static assets if in production
if (process.env.NODE.ENV === 'production')
{
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => 
  {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

//Mongo DB Variables
const { MongoClient } = require("mongodb");
const url =
  "mongodb+srv://conn-master:Group23IsGoated@ttcluster.fwv7kkt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);
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

//#region Create/Register User API Endpoint

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

      //THIS IS A SECURITY FLAW, CHECK TECH DEBT
      await db.collection("counters").updateOne({
        _id: "userID",},
        {$set:{seq: count.seq + 1}}
      );

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

//#endregion 

//#region User Login API Endpoint

app.options("/users/auth", (req, res) => {
  //Get the request body and grab user from it
  const { email, password } = req.body;

  (async () => {
    var ret = await await loginAndValidate(email, password);

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

async function loginAndValidate(userEmail, password) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  // create return
  var retResults = {
    userID: -1,
    email: userEmail,
    password: password
  };

  var ret = {
    success: false,
    message: "",
    results: retResults
  }

  try {
    var user = await db.collection("users").findOne({ email: userEmail });

    pass = String(user.password);

    if (ret.results.password == pass) {
      ret.success = true;
      ret.results.userID = user.userID;
      ret.message = "Successfully logged in user"
    } else {
      ret.message = "Invalid username or password";
    }
  } catch {
    ret.message = "A user with this email address does not exist";
  }

  await client.close();
  return ret;
}

//#endregion

//#region Search song API
// To implement lazy loading of size n: db.collection("songs").find().limit(n)  

app.get('/songs/searchall', (req, res) => {
  // Outgoing (result body): {data: [
  //                                  {_id1, songID1, title1, artist1, album1, url1, length1, year1, likes1 },
  //                                  {_id2, songID2, title2, artist2, album2, url2, length2, year2, likes2 },
  //                                   ...
  //                                ],
  //                          status: "message"
  //                         }

  (async () => {
    var ret = await getAllSongs();

    res.status(200).json(ret);
  })();
});

async function getAllSongs() {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {data: [], status: ''};

  try {
    // create return (it is up to the frontend to display the fields they want).
    var data = await db.collection("songs").find().toArray();
    ret.data = data;
    ret.status = "success";
  } catch (e) {
    console.log(e);
    ret.status = "failure";
  }

  await client.close();
  return ret;
}

//#endregion

//Connect to server and output when running
app.listen(PORT, () => 
{
  console.log("Server is running...");
});
//