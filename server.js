//const
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const bcrypt = require("bcryptjs");

//porting
const PORT = process.env.PORT || 5000;
app.set('port', PORT);
app.listen(PORT, () => console.log("Server is running..."));

//exports
module.exports = app;

//app properties
app.use(logger("tiny"));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(bodyParser.json());

//cors
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

// build heroku app from frontend
app.use(express.static('frontend/build'));

//#region Create/Register User API Endpoint

app.post("/users", (req, res) => { // WITH HASHED PASSWORD

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

      // hash created password
      var salt = bcrypt.genSaltSync(10);
      var hashedPassword = bcrypt.hashSync(password, salt);

      //Add the new user into the database
      await db.collection("users").insertOne({
        userID: count.seq + 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        isVerified: false,
        password: hashedPassword,
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
      ret.message = "Error occurred while adding user";
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

app.post("/users/auth", (req, res) => { // COMPARING WITH HASHED PASSWORD
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
    
    // compare entered password with hashed password
    var validPassword = await bcrypt.compareSync(ret.results.password, pass);

    if (validPassword) {
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

//#region User reset password

app.put("/users/:userId([0-9]+)/password", (req, res) => {

  var id = req.params.userId;
  const { password } = req.body;

  (async () => {
    var ret = await passwordReset(id, password);

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

async function passwordReset(userId, newPassword) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  userId = parseInt(userId);

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var user = await db.collection("users").findOne({ userID: userId });

    await db.collection("users").updateOne(
      user, 
      {$set:{password: newPassword}
    });

    ret.success = true;
    ret.message = "Password Reset.";
    ret.results = user;
    
  } catch {
    ret.message = "We were unable to reset the user's password.";
  }

  await client.close();
  return ret;
}

//#endregion

//#region User Change Email API endpoint

app.put("/users/:userId([0-9]+)/changeEmail", (req, res) => { 
  //Get the request body and grab user from it
  var id = req.params.userId;
  const { newEmail } = req.body;

  (async () => {
    var ret = await emailReset(id, newEmail);

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

async function emailReset(userId, newEmail) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  // create return
  var ret = {
    success: false,
    message: "",
    results: {
      userID: -1,
      newEmail: newEmail
    }
  };

  try {
    var user = await db.collection("users").findOne({ userID: parseInt(userId) });
    
    await db.collection("users").updateOne(
      user, 
      {$set:{email: newEmail}
    });

    ret.success = true;
    ret.results.userID = user.userID;
    ret.message = "Sucessfully changed email address";

  } catch {
    ret.message = "Unable to change the user's email address";
  }

  await client.close();
  return ret;
}

//#endregion

//#region Delete user API endpoint

app.delete("/users/:userId([0-9]+)/delete", (req, res) => {

  var id = req.params.userId;

  (async () => {
    var ret = await deleteUser(id);

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

async function deleteUser(userId) {
  // Connect to db
  await client.connect();
  db = client.db("TuneTables");

  console.log(`Attempting to delete user with ID=${userId}...\n`);
  userId = parseInt(userId);

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    // Check if user exists (can delete this code if we don't care whether a user exists)
    exists = await db.collection("users").findOne({ userID: userId });
    if (!exists)
    {
      console.log(`User does not exist.\n`);
      ret.message = "User does not exist.";
      ret.results = -1;
      await client.close();
      return ret;
    }

    // Delete user
    await db.collection("users").deleteOne({ userID: exists.userID });
    console.log(`Successfully deleted user.\n`);
    ret.success = true;
    ret.message = "Deleted user.";
    ret.results = userId;
  } catch {
    ret.message = "We were unable to delete the user.";
    ret.results = -1;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display all users API endpoint

app.get('/users', (req, res) => {
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

app.get('/users/search', (req, res) => {
  // Parse request body
  const {keyword} = req.body;
  var _keyword = keyword.trim();
  
  (async () => {
    var ret = await searchForUser(_keyword);

    res.status(200).json(ret);
  })();
});

async function searchForUser(_keyword) {
  console.log(`Searching for user...`);
  console.log(`thingToSearch: ${_keyword}\n`);

  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var data = [];
    data = await db.collection("users").find({ firstName:_keyword }).toArray();
    data = data.concat(await db.collection("users").find({ lastName:_keyword }).toArray());
    data = data.concat(await db.collection("users").find({ email:_keyword }).toArray());

    ret.success = true;
    ret.message = `${data.length} results found.`;
    ret.results = data;

  } catch (e) {
    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display all songs API endpoint
app.get('/songs', (req, res) => {
  (async () => {
    var ret = await getAllSongs();

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

async function getAllSongs() {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    // create return (it is up to the frontend to display the fields they want).
    var data = [];
    data = await db.collection("songs").find().toArray();
    ret.success = true;
    ret.results = data;
  } catch (e) {
    console.log(e);
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display specific songs API endpoint
app.get('/songs/search', (req, res) => {
  const {keyword} = req.body;
  var _keyword = keyword.trim();
  
  (async () => {
    var ret = await searchForSong(_keyword);

    res.status(200).json(ret);
  })();
});

async function searchForSong(_keyword) {
  console.log(`Searching for song...`);
  console.log(`thingToSearch: ${_keyword}\n`);

  await client.connect();
  db = client.db("TuneTables");

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    // create return (it is up to the frontend to display the fields they want).
    // var data = await db.collection("songs").find(
    //   { title:_title, artist:_artist, album:_album, length:_length, year:_year, likes:_likes }).toArray();

    var data = [];
    data = await db.collection("songs").find({ title:_keyword }).toArray();
    data = data.concat(await db.collection("songs").find({ artist:_keyword }).toArray());
    data = data.concat(await db.collection("songs").find({ album:_keyword }).toArray());

    if (data.length > 0)
    {
      ret.success = true;
      ret.message = `${data.length} results found.`
      ret.results = data;
    }
  } catch (e) {
    console.log(e);
    ret.message = `Error searching for ${_keyword}`
  }

  await client.close();
  return ret;
}

//#endregion

//Leave this at the bottom, it ovverides other get requests
app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})