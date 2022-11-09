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

//#region Helper Functions

function omit(obj, omitKey) {
  return Object.keys(obj).reduce((result, key) => {

    if(key !== omitKey) {
       result[key] = obj[key];
    }

    return result;

  }, {});
}

//#endregion 

//#region Create/Register User API Endpoint

app.post("/users", (req, res) => { // WITH HASHED PASSWORD

  const { email, password, firstName, lastName } = req.body;

  //error handling for user input
  const fields = [];
  if (!email) {
    fields.push("Email");
  } 
  if (!firstName) 
  {
    fields.push("First Name");
  } 
  if (!lastName) {
    fields.push("Last Name");
  } 
  if (!password) 
  {
    fields.push("Password");
  }

  if(fields.length != 0){
    
    var error = "Missing required field(s): ";
    error = error + fields[0];
    for(let i = 1; i < fields.length; i++){
      error = error + ", " + fields[i];
    }
    
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

      // hash created password
      var salt = bcrypt.genSaltSync(10);
      var hashedPassword = bcrypt.hashSync(password, salt);

      //Add the new user into the database
      await db.collection("users").insertOne({
        firstName: firstName,
        lastName: lastName,
        email: email,
        isVerified: false,
        password: hashedPassword,
        totalLikes: 0,
        relationships: [],
      });

      var user = await db.collection("users").findOne({ email: email });

      ret.success = true;
      ret.message = "Successfully added user.";
      ret.results = omit(user, 'password');

    } 
    catch 
    {
      ret.message = "Error occurred while adding user";
    }
  }
  else
  {
    ret.message = "Could not create account.";
  }

  await client.close();
  console.log(ret);
  return ret;

}

//#endregion 

//#region User Login API Endpoint

app.post("/users/auth", (req, res) => {

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

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var user = await db.collection("users").findOne({ email: userEmail });

    pass = String(user.password);

    // compare entered password with hashed password
    var validPassword = await bcrypt.compareSync(password, pass);

    if (validPassword) {
      ret.success = true;
      ret.results = omit(user, 'password');
      ret.message = "Successfully logged in user"
    } else {
      ret.message = "Invalid email or password.";
    }
  } catch {
    ret.message = "Invalid email or password";
  }

  await client.close();
  return ret;
}

//#endregion

//#region User reset password

app.put("/users/:userId/password", (req, res) => { //TODO: Fix and add hashing to passwords

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
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  // hash created password
  var salt = bcrypt.genSaltSync(10);
  var hashedPassword = bcrypt.hashSync(newPassword, salt);

  try {
    var user = await db.collection("users").findOne({ _id: ObjectId(userId) });

    await db.collection("users").updateOne(
      user, 
      {$set:{password: hashedPassword}
    });

    ret.success = true;
    ret.message = "Your password has been reset.";
    ret.results = omit(user, 'password');
    
  } catch {
    ret.message = "We were unable to reset the user's password.";
  }

  await client.close();
  return ret;
}

//#endregion

//#region User Change Email API endpoint

app.put("/users/:userId/changeEmail", (req, res) => { 
  const { newEmail } = req.body;

  (async () => {
    var ret = await emailReset(req.params.userId, newEmail);

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
  var ObjectId = require('mongodb').ObjectId;

  // create return
  var ret = {
    success: false,
    message: "",
    results: {
      _id: -1,
      newEmail: newEmail
    }
  };

  try {
    var user = await db.collection("users").findOne({ _id: ObjectId(userId) });
    
    await db.collection("users").updateOne(
      user, 
      {$set:{email: newEmail}
    });

    ret.success = true;
    ret.results._id = user._id;
    ret.message = "Sucessfully changed email address";

  } catch (e) {
    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Delete user API endpoint

app.delete("/users/:userId/delete", (req, res) => {
  (async () => {
    var ret = await deleteUser(req.params.userId);

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

  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    
    exists = await db.collection("users").findOne({ _id: ObjectId(userId) });
    if (!exists)
    {
      ret.success = true;
      ret.message = "User does not exist.";
      ret.results = userId;
      await client.close();
      return ret;
    }

    // Delete user
    await db.collection("users").deleteOne({ _id: ObjectId(exists._id) });
    console.log(`Successfully deleted user.\n`);
    ret.success = true;
    ret.message = "Deleted user.";
    ret.results = userId;
  } catch (e) {
    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display all users API endpoint

app.get('/users', (req, res) => {
  (async () => {
    var ret = await getAllUsers();

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

async function getAllUsers() {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var results = await db.collection("users").find().toArray();

    if (results.length != 0)
    {
      ret.results = results;
      ret.message = `${results.length} user(s) found.`;
    }
    else
    {
      ret.message = `No users found.`;
    }
    ret.success = true;

  } catch (e) {
    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display specific users API endpoint

  app.get("/users/search/:keyword", (req, res) => {
    (async () => {
      var ret = await searchForUser(req.params.keyword);
  
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
  
  async function searchForUser(keyword) {
    console.log(`keyword: ${keyword}\n`);
  
    // Connect to db and get user
    await client.connect();
    db = client.db("TuneTables");
  
    var ret = {
      success: false,
      message: "",
      results: {}
    }
  
    try {
      var results = [];
      results = await db.collection("users").find({ firstName:keyword }).toArray();
      results = results.concat(await db.collection("users").find({ lastName:keyword }).toArray());
      results = results.concat(await db.collection("users").find({ email:keyword }).toArray());
  
      if (results.length != 0)
      {
        ret.message = `${results.length} user(s) found.`;
        ret.results = results;
      }
      else
      {
        ret.message = `No users found.`;
      }
      ret.success = true;

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

  await client.connect();
  db = client.db("TuneTables");

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var results = [];
    results = await db.collection("songs").find().toArray();

    if (results.length != 0)
    {
      ret.results = results;
      ret.message = `${results.length} song(s) found.`;
    }
    else
    {
      ret.message = `No songs found.`;
    }
    ret.success = true;

  } catch (e) {
    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display specific songs API endpoint

app.get('/songs/search/:keyword', (req, res) => {
  (async () => {
    var ret = await searchForSong(req.params.keyword);

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

async function searchForSong(keyword) {
  await client.connect();
  db = client.db("TuneTables");

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var results = [];
    results = await db.collection("songs").find({ title:keyword }).toArray();
    results = results.concat(await db.collection("songs").find({ artist:keyword }).toArray());
    results = results.concat(await db.collection("songs").find({ album:keyword }).toArray());

    if (results.length != 0)
    {
      ret.message = `${results.length} song(s) found.`;
      ret.results = results;
    }
    else
    {
      ret.message = `No songs found.`;
    }
    ret.success = true;
    
  } catch (e) {
    console.log(e);
    ret.message = e;
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