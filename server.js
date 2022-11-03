//const
const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;
const app = express();
app.set('port', (process.env.PORT || 5000));
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");

//exports
module.exports = app;

//app properties
app.use(logger("tiny"));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

//Mongo DB Variables (ADD MONGODB_URL AS ENV VARIABLE ON HEROKU SETTINGS)
require('dotenv').config();
const url = process.env.MONGODB_URL;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
client.connect();
//

//Connect to server and output when running
app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));
//

// build heroku app from frontend
app.use(express.static('frontend/build'));
app.get('*', (req, res) =>
{
  res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
});

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

//#region Create/Register User API Endpoint

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

app.post("/users/auth", (req, res) => {
  //Get the request body and grab user from it
  const { email, password } = req.body;

  (async () => {
    var ret = await loginAndValidate(email, password);

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

//#region Display all songs API endpoint
app.get('/songs/searchall', (req, res) => {
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

//#region Display specific songs API endpoint
app.post('/songs/searchspecific', (req, res) => {
  // Parse request body
  const {thingToSearch} = req.body;
  var _thingToSearch = thingToSearch.trim();
  
  (async () => {
    var ret = await searchForSong(_thingToSearch);

    res.status(200).json(ret);
  })();
});

async function searchForSong(_thingToSearch) {
  console.log(`Searching for song...`);
  console.log(`thingToSearch: ${_thingToSearch}\n`);

  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {data: [], status: ""};

  try {
    // create return (it is up to the frontend to display the fields they want).
    // var data = await db.collection("songs").find(
    //   { title:_title, artist:_artist, album:_album, length:_length, year:_year, likes:_likes }).toArray();

    var data = [];
    data = await db.collection("songs").find({ title:_thingToSearch }).toArray();
    if (data.length == 0)
    {
      data = await db.collection("songs").find({ artist:_thingToSearch }).toArray();
      if (data.length == 0)
      {
        data = await db.collection("songs").find({ album:_thingToSearch }).toArray();
        if (data.length == 0)
        {
          data = await db.collection("songs").find({ length:_thingToSearch }).toArray();
          if (data.length == 0)
          {
            data = await db.collection("songs").find({ year:_thingToSearch }).toArray();
            console.log(`Match(s) found in year category\n`);
            if (data.length == 0)
            {
              _thingToSearch = parseInt(_thingToSearch, 10);
              data = await db.collection("songs").find({ likes:_thingToSearch }).toArray();
              if (data.length != 0)
              {
                console.log(`Match(s) found in likes category\n`);
              }
            }
            else
            {
              console.log(`Match(s) found in year category\n`);
            }
          }
          else
          {
            console.log(`Match(s) found in length category\n`);
          }
        }
        else
        {
          console.log(`Match(s) found in album category\n`);
        }
      }
      else
      {
        console.log(`Match(s) found in artist category\n`);
      }
    }
    else
    {
      console.log(`Match(s) found in title category\n`);
    }

    if (data.length > 0)
    {
      ret.data = data;
      ret.status = "success";
    }
  } catch (e) {
    console.log(e);
    ret.status = "failure";
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display all users API endpoint
app.get('/users/searchall', (req, res) => {
  (async () => {
    var ret = await getAllUsers();

    res.status(200).json(ret);
  })();
});

async function getAllUsers() {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {data: [], status: ''};

  try {
    // create return (it is up to the frontend to display the fields they want).
    var data = await db.collection("users").find().toArray();
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

//#region Display specific users API endpoint

app.post('/users/searchspecific', (req, res) => {
  // Parse request body
  const {thingToSearch} = req.body;
  var _thingToSearch = thingToSearch.trim();
  
  (async () => {
    var ret = await searchForUser(_thingToSearch);

    res.status(200).json(ret);
  })();
});

async function searchForUser(_thingToSearch) {
  console.log(`Searching for user...`);
  console.log(`thingToSearch: ${_thingToSearch}\n`);

  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {data: [], status: ""};

  try {
    var data = [];
    data = await db.collection("users").find({ firstName:_thingToSearch }).toArray();
    if (data.length == 0)
    {
      data = await db.collection("users").find({ lastName:_thingToSearch }).toArray();
      if (data.length == 0)
      {
        data = await db.collection("users").find({ email:_thingToSearch }).toArray();
        if (data.length == 0)
        {
          data = await db.collection("users").find({ totalLikes:_thingToSearch }).toArray();
          if (data.length != 0)
          console.log(`Match(s) found in totalLikes category\n`);
        }
        else
        {
          console.log(`Match(s) found in email category\n`);
        }
      }
      else
      {
        console.log(`Match(s) found in lastName category\n`);
      }
    }
    else
    {
      console.log(`Match(s) found in firstName category\n`);
    }

    if (data.length > 0)
    {
      ret.data = data;
      ret.status = "success";
    }
  } catch (e) {
    console.log(e);
    ret.status = "failure";
  }

  await client.close();
  return ret;
}

//#endregion
