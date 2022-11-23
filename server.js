//const
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const e = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken")

//getting env config
dotenv.config();

//porting
const PORT = process.env.PORT || 5000;
app.set('port', PORT);

if (process.env.NODE_ENV !== 'test') { // this is to avoid jest complaining about unclosed listeners when running tests
  app.listen(PORT, () => console.log("Server is running..."));
};



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


function createToken(username, password) {
  //Create Json Web Token for user authentication  
  let token;

  try {
    token = jwt.sign({username: username, password: password}, process.env.TOKEN_SECRET, {expiresIn: '3600s'});
  }
  catch (error) {
    console.log(error);
    return(error); 
  }

  return token;
}

function authenticateToken(req, res) {
  const token = req.headers.authorization.split(' ')[1];

  if(!token) return res.status(401);

  try{
    jwt.verify(token, process.env.TOKEN_SECRET);
    return 1; 
  }
  catch (err) {
    return 0;
  }
}

//#endregion 

//JWT Testing and reference code
app.post("/createToken", (req, res, next) => {
  const {username, password}  = req.body;

  if(username != username || password != password){
    res.status(400);
  }

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  const token = createToken(username, password);

  ret.success = true;
  ret.results = {username: username, password: password, token: token};

  return res.status(200).json(ret);

});

app.post("/testToken", (req, res) => {
  
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "No Idea"});

  var ret = {
    success: true,
    message: "",
    results: {
      username: req.body.username,
      password: req.body.password
    }
  }

  return res.status(200).json(ret);
});


//#region Create/Register User API Endpoint

app.post("/users", (req, res) => { // WITH HASHED PASSWORD

  const { email, username, password, firstName, lastName } = req.body;

  //error handling for user input
  const fields = [];
  if (!email) {
    fields.push("Email");
  } 
  if (!username) 
  {
    fields.push("Username");
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
    var ret = await addUser(email, username, password, firstName, lastName);

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

async function addUser(email, username, password, firstName, lastName) {

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
        username: username,
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
    catch (e)
    {
      // ret.message = "Error occurred while adding user";
      console.log(e);
      ret.message = e;
    }
  }
  else
  {
    ret.message = "Could not create account.";
  }

  await client.close();
  return ret;

}

//#endregion 

//#region User Login API Endpoint

app.post("/users/auth", (req, res) => {

  const { username, password } = req.body;

  (async () => {
    var ret = await loginAndValidate(username, password);

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

async function loginAndValidate(userName, password) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var user = await db.collection("users").findOne({ username: userName });

    pass = String(user.password);

    // compare entered password with hashed password
    var validPassword = await bcrypt.compareSync(password, pass);

    if (validPassword) {
      ret.success = true;
      ret.results = omit(user, 'password');
      ret.message = "Successfully logged in user"
    } else {
      ret.message = "Invalid username or password.";
    }
  } catch (e) {
    // ret.message = "Invalid username or password";
    console.log(e);
    ret.message = e;
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
    
  } catch (e) {
    // ret.message = "We were unable to reset the user's password.";
    console.log(e);
    ret.message = e;
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
      var resultsCheck = [];
      resultsCheck = await db.collection("users").find({'email': {'$regex': keyword},}).toArray();
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'username': {'$regex': keyword},}).toArray());

      //Remove duplicates
      const results = Array.from(new Set(resultsCheck.map(a => a.email)))
        .map(email => {
          return resultsCheck.find(a => a.email === email)
      })
  
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

//#region Get a user's relationships API endpoint

app.get('/users/:userId/relationships', (req, res) => {
  (async () => {
    var ret = await getRelationships(req.params.userId);

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

async function getRelationships(userId) {
  // Connect to db
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var exists = await db.collection("users").findOne({ _id: ObjectId(userId) });

    if (exists)
    {
      ret.results = exists.relationships;
      
      if (ret.results.length != 0)
        ret.message = `${ret.results.length} relationship(s) found.`;
      else
        ret.message = `No relationships found.`
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
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

//#region get user's friends API endpoint 

app.get('/users/:userId/friends', (req, res) => {
  (async () => {
    var ret = await getFriends(req.params.userId);

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

async function getFriends(userId) {
  // Connect to db
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var exists = await db.collection("users").findOne({ _id: ObjectId(userId) });

    if (exists)
    {
      ret.results = [];
      for (var i = 0; i < exists.relationships.length; i++)
      {
        if (exists.relationships[i].friend)
        {
          ret.results.push(exists.relationships[i].id);
        }
      }

      if (ret.results.length != 0)
        ret.message = `${ret.results.length} friend(s) found.`;
      else
        ret.message = `No friends found.`
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
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

//#region search user's friends based on keyword API endpoint

app.get("/users/:userId/searchFriends/:keyword", (req, res) => {
  (async () => {
    var ret = await searchForFriends(req.params.userId, req.params.keyword);

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

async function searchForFriends(userId, keyword) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  var user = await db.collection("users").findOne({ _id: ObjectId(userId) });
  var resultsCheck = [];
  var personId;

  try {
    if (user) // If user exists in db
    {
      // Find all users that have [keyword] for at least one of their attributes/fields
      var resultsCheck = [];
      resultsCheck = await db.collection("users").find({'email': {'$regex': keyword},}).toArray();
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'username': {'$regex': keyword},}).toArray());
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'firstName': {'$regex': keyword},}).toArray());
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'lastName': {'$regex': keyword},}).toArray());

      if (resultsCheck.length != 0)
      {
        //Remove duplicates
        const results = Array.from(new Set(resultsCheck.map(a => a.email)))
        .map(email => {
          return resultsCheck.find(a => a.email === email)
        })

        // Iterate over each user in results array to check whether they are a friend.
        // If friend, add to ret.results
        ret.results = [];
        for (var i = 0; i < results.length; i++)
        {
          personId = (results[i]._id).toString();
          for (var j = 0; j < user.relationships.length; j++)
          {
            if (personId == user.relationships[j].id && user.relationships[j].friend)
            {
              delete results[i].password;
              ret.results.push(results[i]);
            }
          }
        }

        ret.message = `${ret.results.length} friend(s) found with keyword = ${keyword}`;
      }
      else
      {
        ret.message = `${ret.results.length} friend(s) found with keyword = ${keyword}`;
        ret.results = 2;
      } 
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
      ret.results = 3;
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

//#region search user's blocked list based on keyword API endpoint

app.get("/users/:userId/searchBlocked/:keyword", (req, res) => {
  (async () => {
    var ret = await searchForBlocked(req.params.userId, req.params.keyword);

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

async function searchForBlocked(userId, keyword) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  var user = await db.collection("users").findOne({ _id: ObjectId(userId) });
  var resultsCheck = [];
  var personId;

  try {
    if (user) // If user exists in db
    {
      // Find all users that have [keyword] for at least one of their attributes/fields
      var resultsCheck = [];
      resultsCheck = await db.collection("users").find({'email': {'$regex': keyword},}).toArray();
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'username': {'$regex': keyword},}).toArray());
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'firstName': {'$regex': keyword},}).toArray());
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'lastName': {'$regex': keyword},}).toArray());

      if (resultsCheck.length != 0)
      {
        //Remove duplicates
        const results = Array.from(new Set(resultsCheck.map(a => a.email)))
        .map(email => {
          return resultsCheck.find(a => a.email === email)
        })

        // Iterate over each user in results array to check whether they are blocked.
        // If blocked, add to ret.results
        ret.results = [];
        for (var i = 0; i < results.length; i++)
        {
          personId = (results[i]._id).toString();
          for (var j = 0; j < user.relationships.length; j++)
          {
            if (personId == user.relationships[j].id && user.relationships[j].blocked)
            {
              delete results[i].password;
              ret.results.push(results[i]);
            }
          }
        }

        ret.message = `${ret.results.length} blocked user(s) found with keyword = ${keyword}`;
      }
      else
      {
        ret.message = `${ret.results.length} blocked user(s) found with keyword = ${keyword}`;
        ret.results = 2;
      } 
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
      ret.results = 3;
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

//#region get user's blocked API endpoint 

app.get('/users/:userId/blocked', (req, res) => {
  (async () => {
    var ret = await getBlocked(req.params.userId);

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

async function getBlocked(userId) {
  // Connect to db
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var exists = await db.collection("users").findOne({ _id: ObjectId(userId) });

    if (exists)
    {
      ret.results = [];
      for (var i = 0; i < exists.relationships.length; i++)
      {
        if (exists.relationships[i].blocked)
        {
          ret.results.push(exists.relationships[i].id);
        }
      }

      if (ret.results.length != 0)
        ret.message = `${ret.results.length} blocked user(s) found.`;
      else
        ret.message = `No blocked users found.`
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
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

//#region add friend API endpoint

app.post('/users/:userId/addFriend/:friendId', (req, res) => {
  (async () => {
    var ret = await addFriend(req.params.userId, req.params.friendId);

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

async function addFriend(userId, friendId) {
  // Connect to db
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  // Object to be stored in a user's relationship array
  var friend_object = {
      id: friendId.toString(),
      friend: true,
      blocked: false  
  }

  try {
    var user    = await db.collection("users").findOne({ _id: ObjectId(userId) });
    var friend  = await db.collection("users").findOne({ _id: ObjectId(friendId) });

    if (user) // If user exists in db
    {
      if (friend) // If friend exists in db
      {
        // If any of these variables become true, the user cannot add the friend
        var isFriend = false;
        var isBlocked = false;
        var blockingFriend = false;

        // The user wants to add the friend. Iterate over friend's relationship array
        // to check if that friend is blocking the user
        for (var i = 0; i < friend.relationships.length; i++)
        {
          // If the friend has a relationship with the user and friend is blocking the user...
          if (userId == (friend.relationships[i].id) && friend.relationships[i].blocked)
          {
            isBlocked = true;
            break;
          }
        }

        // Iterate over the user's relationship array to check whether the user is currently
        // blocking the friend
        for (var i = 0; i < user.relationships.length; i++)
        {
          // If the user has a relationship with the friend...
          if (friendId == (user.relationships[i].id))
          {
            // Check if already friends
            if (user.relationships[i].friend)
              isFriend = true;
            
            // Check if user is blocking friend
            if (user.relationships[i].blocked)
              blockingFriend = true;
            
            break;
          }
        }

        if (!isFriend)
        {
          if (!isBlocked)
          {
            if (!blockingFriend)
            {
              // If not blocked, not a friend, and user is currently not blocking them,
              // add relationship to user's relationship array
              await db.collection("users").updateOne(
                user, 
                {$push:{relationships: friend_object}}
              );

              ret.message = `Successfully added friend.`;
              ret.results = 0;
            }
            else
            {
              ret.message = `Cannot add a user that you are currently blocking.`;
              ret.results = 1;
            }
          }
          else
          {
            ret.message = `Cannot add a user that is currently blocking you.`;
            ret.results = 2;
          }
        }
        else
        {
          ret.message = `Friend has already been added.`;
          ret.results = 3;
        }
      }
      else
      {
        ret.message = `No user found with id = ${friendId}`;
        ret.results = 4;
      }
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
      ret.results = 5;
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

//#region Delete Friend API endpoint 

app.post('/users/:userId/unfriend/:friendId', (req, res) => {
  (async () => {
    var ret = await deleteFriend(req.params.userId, req.params.friendId);

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

async function deleteFriend(userId, friendId) {
  // Connect to db
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var user    = await db.collection("users").findOne({ _id: ObjectId(userId) });
    var friend  = await db.collection("users").findOne({ _id: ObjectId(friendId) });

    if (user) // If user exists in db
    {
      if (friend) // If friend exists in db
      {
        // Check if friend is in user's relationship array and is truly a friend
        var isFriend = false;
        for (var i = 0; i < user.relationships.length; i++)
        {
          if (friendId == user.relationships[i].id && user.relationships[i].friend)
          {
            isFriend = true;
          }
        }

        if (isFriend)
        {
          // Delete the relationship entirely
          await db.collection("users").updateOne(
            user, 
            {$pull: {"relationships": {id: friendId}}}
          );

          ret.message = `Successfully deleted friend.`;
          ret.results = 0;
        }
        else
        {
          ret.message = `User was not a friend.`;
          ret.results = 1;
        }
      }
      else
      {
        ret.message = `No user found with id = ${friendId}`;
        ret.results = 2;
      }
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
      ret.results = 3;
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

//#region block user API endpoint

app.post('/users/:userId/block/:blockedId', (req, res) => {
  (async () => {
    var ret = await blockUser(req.params.userId, req.params.blockedId);

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

async function blockUser(userId, blockedId) {
  // Connect to db
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  // Object to be stored in a user's relationship array
  var blocked_object = {
      id: blockedId,
      friend: false,
      blocked: true 
  }

  try {
    var user        = await db.collection("users").findOne({ _id: ObjectId(userId) });
    var blockedUser = await db.collection("users").findOne({ _id: ObjectId(blockedId) });

    if (user) // If user exists in db
    {
      if (blockedUser) // If blocked user exists in db
      {
        // If any of these variables are true, no blocking occurs
        var isFriend = false;
        var isBlocked = false;

        // Iterate to check if a relationship already exists between user and blockedUser
        for (var i = 0; i < user.relationships.length; i++)
        {
          // If relationship exists...
          if (blockedId == (user.relationships[i].id))
          {
            // Check if already blocked
            if (user.relationships[i].blocked)
              isBlocked = true;
            
            // Check whether they are a friend
            if (user.relationships[i].friend)
              isFriend = true;

            break;
          }
        }

        if (!isBlocked)
        {
          if (!isFriend)
          {
            // If not blocked and not a friend, add relationship to user's relationship array
            await db.collection("users").updateOne(
              user, 
              {$push:{relationships: blocked_object}
            });

            ret.message = `Successfully blocked user.`;
            ret.results = 0;
          }
          else
          {
            await db.collection("users").updateOne(
              // Update all objects in relationships array that have an id of blockedId
              {_id: ObjectId(userId), "relationships.id": blockedId},
              // Unfriend user and block the user
              {$set: {"relationships.$.friend": false, "relationships.$.blocked": true}}
            );

            ret.message = `Successfully unfriended user and blocked user.`;
            ret.results = 1;
          }

          // Remove user from blockedUser's relationship array.
          // Iterate to check if a relationship exists in blockedUser's relationship array
          for (var i = 0; i < blockedUser.relationships.length; i++)
          {
            // If relationship exists and user is a friend of blockedUser, delete the relationship
            if (userId == (blockedUser.relationships[i].id) && blockedUser.relationships[i].friend)
            {
              await db.collection("users").updateOne(
                blockedUser, 
                {$pull: {"relationships": {id: userId}}}
              );              

              break;
            }
          }
        }
        else
        {
          ret.message = `User has already been blocked.`;
          ret.results = 2;
        }
      }
      else
      {
        ret.message = `No user found with id = ${blockedId}`;
        ret.results = 3;
      }
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
      ret.results = 4;
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

//#region unblock user API endpoint 

app.post('/users/:userId/unblock/:blockedId', (req, res) => {
  (async () => {
    var ret = await unblockUser(req.params.userId, req.params.blockedId);

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

async function unblockUser(userId, blockedId) {
  // Connect to db
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var user        = await db.collection("users").findOne({ _id: ObjectId(userId) });
    var blockedUser = await db.collection("users").findOne({ _id: ObjectId(blockedId) });

    if (user) // If user exists in db
    {
      if (blockedUser) // If blocked user exists in db
      {
        // Check if blocked user is in user's relationship array and is truly blocked
        var isBlocked = false;
        for (var i = 0; i < user.relationships.length; i++)
        {
          if (blockedId == user.relationships[i].id && user.relationships[i].blocked)
          {
            isBlocked = true;
          }
        }

        if (isBlocked)
        {
          // Delete the relationship entirely
          await db.collection("users").updateOne(
            user, 
            {$pull: {"relationships": {id: blockedId}}}
          );

          ret.message = `Successfully unblocked user.`;
          ret.results = 0;
        }
        else
        {
          ret.message = `User was not blocked.`;
          ret.results = 1;
        }
      }
      else
      {
        ret.message = `No user found with id = ${blockedId}`;
        ret.results = 2;
      }
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
      ret.results = 3;
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

//#region Create song API endpoint

app.post("/songs", (req, res) => {

  const { title, artist, album, url, length, year } = req.body;
  var songObject = req.body;

  //error handling for user input
  const fields = [];
  if (!title) {
    fields.push("title");
  } 
  if (!artist) 
  {
    fields.push("artist");
  } 
  if (!album) {
    fields.push("album");
  } 
  if (!url) 
  {
    fields.push("url");
  }
  if (!length) 
  {
    fields.push("length");
  }
  if (!year) 
  {
    fields.push("year");
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
    var ret = await addSong(songObject);

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

async function addSong(songObject) {

  var ret = {
    "success": false,
    "message": "",
    "results": {}
  }

  // establish db connection
  await client.connect();
  db = client.db("TuneTables");

  try {


    await db.collection("songs").insertOne({
      title: songObject.title,
      artist: songObject.artist,
      album: songObject.album,
      url: songObject.url,
      length: songObject.length,
      year: songObject.year,
      likes: 0,
    });

    var song = await db.collection("songs").findOne({ title: songObject.title });

    ret.success = true;
    ret.message = "Successfully added song.";
    ret.results = song;

  }
  catch {
    ret.message = "Error occurred while adding song";
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

    var resultsCheck = [];
    resultsCheck = await db.collection("songs").find({'title': {'$regex': keyword},}).toArray();
    resultsCheck = resultsCheck.concat(await db.collection("songs").find({'artist': {'$regex': keyword},}).toArray());
    resultsCheck = resultsCheck.concat(await db.collection("songs").find({'album': {'$regex': keyword},}).toArray());

    //Remove duplicates
    const results = Array.from(new Set(resultsCheck.map(a => a.title)))
    .map(title => {
      return resultsCheck.find(a => a.title === title)
    })

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

//#region Create post endpoint

app.post('/posts', (req, res) => {

  const { message, song } = req.body;
  var post = req.body;

  //error handling for user input
  const fields = [];
  if (!message) {
    fields.push("message");
  } 
  if (!song) 
  {
    fields.push("song");
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
    var ret = await createPost(post);

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

async function createPost(postObject) {

  var ret = {
    "success": false,
    "message": "",
    "results": {}
  }

  // establish db connection
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;


  try {

    let postId = await db.collection("posts").insertOne({
      creator: ObjectId('637a4f28c782a02d5734bc9c'),
      message: postObject.message,
      song: postObject.song,
      likes: 0,
      updatedAt: Date.now()
    });

    var song = await db.collection("posts").findOne({ _id: postId.insertedId });

    ret.success = true;
    ret.message = "Successfully created post.";
    ret.results = song;

  }
  catch {
    ret.message = "Error occurred while creating post.";
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display all posts API endpoint

app.get('/posts', (req, res) => {
  (async () => {
    var ret = await getAllPosts();

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

async function getAllPosts() {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var results = await db.collection("posts").find().toArray();

    if (results.length != 0)
    {
      ret.results = results;
      ret.message = `${results.length} post(s) found.`;
    }
    else
    {
      ret.message = `No posts found.`;
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

//#region Display all posts made by a user API endpoint

app.get('/posts/:userId', (req, res) => {
  (async () => {
    var ret = await getUserPosts(req.params.userId);

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

async function getUserPosts(userId) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var results = await db.collection("posts").find({ creator: ObjectId(userId) }).toArray();

    if (results.length != 0)
    {
      ret.results = results;
      ret.message = `${results.length} post(s) found.`;
    }
    else
    {
      ret.message = `No posts found.`;
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

//#region Display all friend posts API endpoint

app.get('/posts/:userId/friends', (req, res) => {
  (async () => {
    var ret = await getFriendPosts(req.params.userId);

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

async function getFriendPosts(userId) {
  // Connect to db and get user
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    var user;
    var friendId;
    var friendPosts;
    var results = [];

    user = await db.collection("users").findOne({ _id: ObjectId(userId) });
    if (user) // If user exists in db
    {
      // Iterate through user's relationship array
      for (var i = 0; i < user.relationships.length; i++)
      {
        // If relationship is a frendship...
        if (user.relationships[i].friend)
        {
          // Get friend's ID
          friendId = ObjectId(user.relationships[i].id);

          // Query all posts that have a creator ID of friendId
          friendPosts = await db.collection("posts").find({ creator: friendId }).toArray();

          // Add posts to results
          results = results.concat(friendPosts);
        }
      }

      if (results.length != 0)
      {
        ret.results = results;
        ret.message = `${results.length} post(s) found.`;
      }
      else
      {
        ret.message = `No posts found.`;
      }
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
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