//const
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const e = require("express");

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
        if (exists.relationships[i].friend)
          ret.results.push(exists.relationships[i].id);
      
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
        if (exists.relationships[i].blocked)
          ret.results.push(exists.relationships[i].id);
      
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
      id: friendId,
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
        var duplicate = false;
        var relationship_exists = false;

        // Iterate to check if a relationship exists
        for (var i = 0; i < user.relationships.length; i++)
        {
          // If relationship exists...
          if (friendId == (user.relationships[i].id))
          {
            relationship_exists = true;

            // If already a friend, we have a duplicate (no modification to db)
            if (user.relationships[i].friend)
              duplicate = true;
            
            break;
          }
        }
        if (!duplicate)
        {
          // Add new object to array if relationship doesn't exist
          if (!relationship_exists)
          {
            await db.collection("users").updateOne(
              user, 
              {$push:{relationships: friend_object}}
            );
          }
          // Modify the existing object if relationship arleady exists
          else
          {
            await db.collection("users").updateOne(
              // Update all objects in relationships array that have an id of friendId
              {_id: ObjectId(userId), "relationships.id": friendId},
              // Set blocked field to true
              {$set: {"relationships.$.friend": true}}
            );
          }

          ret.message = `Successfully added friend.`;
          ret.results = friendId;
        }
        else
        {
          ret.message = `Friend has already been added.`;
        }
      }
      else
      {
        ret.message = `No user found with id = ${userId}`;
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
        var isBlocked = false;
        for (var i = 0; i < user.relationships.length; i++)
        {
          if (friendId == user.relationships[i].id)
          {
            if (user.relationships[i].friend)
              isFriend = true;
            if (user.relationships[i].blocked)
              isBlocked = true;
          }
        }

        if (isFriend)
        {
          // Preserve the blocked relationship
          if (isBlocked)
          {
            await db.collection("users").updateOne(
              // Update all objects in relationships array with an id of friendId
              {_id: ObjectId(userId), "relationships.id": friendId},
              // Set friend field to false
              {$set: {"relationships.$.friend": false}}
            );
          }
          // Delete the relationship entirely
          else
          {
            await db.collection("users").updateOne(
              user, 
              {$pull: {"relationships": {id: friendId}}}
            );
          }

          ret.message = `Successfully deleted friend.`;
          ret.results = friendId;
        }
        else
        {
          ret.message = `User was not a friend.`;
        }
      }
      else
      {
        ret.message = `No user found with id = ${userId}`;
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
        var duplicate = false;
        var relationship_exists = false;

        // Iterate to check if a relationship exists
        for (var i = 0; i < user.relationships.length; i++)
        {
          // If relationship exists...
          if (blockedId == (user.relationships[i].id))
          {
            relationship_exists  = true;

            // If already blocked, we have a duplicate (no modification to db)
            if (user.relationships[i].blocked)
              duplicate = true;

            break;
          }
        }

        if (!duplicate)
        {
          // Add new object to array if relationship doesn't exist
          if (!relationship_exists)
          {
            await db.collection("users").updateOne(
              user, 
              {$push:{relationships: blocked_object}
            });
          }
          // Modify the existing object if relationship already exists
          else
          {
            await db.collection("users").updateOne(
              // Update all objects in relationships array that have an id of blockedId
              {_id: ObjectId(userId), "relationships.id": blockedId},
              // Set blocked field to true
              {$set: {"relationships.$.blocked": true}}
            );
          }

          ret.message = `Successfully blocked user.`;
          ret.results = blockedId;
        }
        else
        {
          ret.message = `User has already been blocked.`;
        }
      }
      else
      {
        ret.message = `No user found with id = ${userId}`;
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
        var isFriend = false;
        var isBlocked = false;
        for (var i = 0; i < user.relationships.length; i++)
        {
          if (blockedId == user.relationships[i].id)
          {
              if (user.relationships[i].blocked)
                isBlocked = true;
              if (user.relationships[i].friend)
                isFriend = true;
          }
        }

        if (isBlocked)
        {
          // Preserve the friend relationship
          if (isFriend)
          {
            await db.collection("users").updateOne(
              // Update all objects in relationships array that have an id of blockedId
              {_id: ObjectId(userId), "relationships.id": blockedId},
              // Set blocked field to false
              {$set: {"relationships.$.blocked": false}}
            );
          }
          // Delete the relationship entirely
          else
          {
            await db.collection("users").updateOne(
              user, 
              {$pull: {"relationships": {id: blockedId}}}
            );
          }

          ret.message = `Successfully unblocked user.`;
          ret.results = blockedId;
        }
        else
        {
          ret.message = `User was not blocked.`;
        }
      }
      else
      {
        ret.message = `No user found with id = ${userId}`;
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

      //Temp, we need to remove this from the database...
      songID: 1000000,

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

//Leave this at the bottom, it ovverides other get requests
app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})