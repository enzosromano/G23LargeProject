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
const jwt = require("jsonwebtoken");
const sendgrid = require("@sendgrid/mail");
const { rmSync } = require("fs");

//getting env config
dotenv.config();

//setting up sendgrid api key
sendgrid.setApiKey(process.env.SENDGRID_KEY);

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

  try{
    const token = req.headers.authorization.split(' ')[1];

    if(!token) return res.status(401);

    jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Token Successfully Authenticated");
    return 1; 
  }
  catch (err) {
    console.log("Incorrect Token or Header Not Found");
    return 1;
  }
}

function sendVerificationEmail(email, userId) {
  const msg = {
    to: email, // Change to your recipient
    from: 'gab.01@hotmail.com', // Change to your verified sender
    subject: 'Tune Table Verification Email',
    text: 'Tune Table Verification',
    html: `Click <strong><a href="tunetable23.herokuapp.com/verify/${userId}">here</a></strong> to verify your email with Tune Table`
  };

  sendgrid
    .send(msg)
    .then(() => {
      console.log('Verification Email Sent')
    })
    .catch((error) => {
      console.error(error)

    });
}

function sendPasswordResetEmail(email) {
  const msg = {
    to: email, // Change to your recipient
    from: 'gab.01@hotmail.com', // Change to your verified sender
    subject: 'Tune Table Password Reset Email',
    text: 'Tune Table Password Reset',
    html: `Click <strong><a href="tunetable23.herokuapp.com/ResetPassword">here</a></strong> to reset your password with Tune Table`
  };

  sendgrid
    .send(msg)
    .then(() => {
      console.log('Password Reset Email Sent')
    })
    .catch((error) => {
      console.error(error)

    });
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

  sendVerificationEmail("gabriel.mousa@knights.ucf.edu", "a123bas9an_asn%2");

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
      res.status(400).json(ret);
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
        likedPosts: []
      });

      var user = await db.collection("users").findOne({ email: email });

      sendVerificationEmail(email, user._id);

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
      res.status(400).json(ret);
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
    results: {},
    token: ""
  }

  try {
    var user = await db.collection("users").findOne({ username: userName });

    pass = String(user.password);

    // compare entered password with hashed password
    var validPassword = await bcrypt.compareSync(password, pass);

    if (validPassword) {
      //Creating the JWT token for the user's session
      var token = createToken(userName, password);
      ret.token = token;

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

app.put("/users/:userId/password", (req, res) => { 
  //This is the endpoint that resets the user's password afterwards

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
      res.status(400).json(ret);
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
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}


app.post("/users/:userId/sendPasswordReset", (req, res) => { 
  //This endpoint gets hit initially when user wants to reset password and it sends the email

  var id = req.params.userId;

  (async () => {
    var ret = await sendPasswordReset(id);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
    }

  })();

});

async function sendPasswordReset(userId) {
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
    var user = await db.collection("users").findOne({ _id: ObjectId(userId) });

    sendPasswordResetEmail(user.email);

    ret.success = true;
    ret.message = "Password Reset Email Sent";

  } catch (e) {
    // ret.message = "We were unable to reset the user's password.";
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

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
      res.status(400).json(ret);
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
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Verify account API endpoint
app.get('/verify/:userId', (req, res) => {
  (async () => {
    var ret = await verifyUser(req.params.userId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
    }
  })();
});

async function verifyUser(userId)
{

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

    // Update their verification status
    await db.collection("users").updateOne(
      { _id: ObjectId(exists._id) },
      { $set: 
        {
          isVerified: true
        }
      });

    console.log(`Successfully updated user.\n`);
    ret.success = true;
    ret.message = "Verified User.";
    ret.results = userId;
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

  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});

  (async () => {
    var ret = await deleteUser(req.params.userId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

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
      res.status(400).json(ret);
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

  app.get("/users/:userId/search/:keyword", (req, res) => {
    (async () => {
      var ret = await searchForUser(req.params.userId, req.params.keyword);
  
      if(ret.success)
      {
        res.status(200).json(ret);
      }
      else
      {
        res.status(400).json(ret);
      }
    })();
  });
  
  async function searchForUser(userId, keyword) {
    // Connect to db and get user
    await client.connect();
    db = client.db("TuneTables");
  
    var ret = {
      success: false,
      message: "",
      results: {}
    }
  
    try {
      var blockedSearchingUser;
      var resultsCheck = [];
      // resultsCheck = await db.collection("users").find({'email': {'$regex': keyword},}).toArray();
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'username': {'$regex': keyword},}).toArray());
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'firstName': {'$regex': keyword},}).toArray());
      resultsCheck = resultsCheck.concat(await db.collection("users").find({'lastName': {'$regex': keyword},}).toArray());

      //Remove duplicates
      const results = Array.from(new Set(resultsCheck.map(a => a.email)))
        .map(email => {
          return resultsCheck.find(a => a.email === email)
      })
  
      // if we have results...
      if (results.length != 0)
      {
        // For each user in results array, iterate over their relationships array
        // to make sure that they are not blocking the user calling the search
        ret.results = [];
        for (var i = 0; i < results.length; i++)
        {
          blockedSearchingUser = false;
          // A user that has no relationships implies that they are not blocking the searching user
          if (results[i].relationships.length == 0)
          {
            delete results[i].password;
            delete results[i].relationships;
            delete results[i].isVerified;
            delete results[i].email;
            delete results[i].likedPosts;
            ret.results.push(results[i]);
          }
          // Accout for two situations: 
          //  (1) user results[i] has relationships with searching user and is not blocking searching user
          //  (2) user results[i] has no relationships with the searching user
          else
          {
            // Check for situation 1
            for (var j = 0; j < results[i].relationships.length; j++)
            {
              // If there exists a relationship with the searching user...
              if (userId == results[i].relationships[j].id)
              {
                // If the searching user is not blocked, add to ret.results
                if (!results[i].relationships[j].blocked)
                {
                  delete results[i].password;
                  delete results[i].relationships;
                  delete results[i].isVerified;
                  delete results[i].email;
                  delete results[i].likedPosts;
                  ret.results.push(results[i]);

                  blockedSearchingUser = true;
                  break;
                }
              }
            }
            // If situation 1 is not the case, situation 2 is true
            if (!blockedSearchingUser)
            {
              delete results[i].password;
              delete results[i].relationships;
              delete results[i].isVerified;
              delete results[i].email;
              delete results[i].likedPosts;
              ret.results.push(results[i]);

              blockedSearchingUser = true;
            }
          }
        }

        ret.message = `${ret.results.length} user(s) found.`;
      }
      else
      {
        ret.message = `No users found.`;
      }
      ret.success = true;

    } catch (e) {
      var check = await checkId(userId, "user");
      if (!(check.message == ""))
      {
        ret = check;
        await client.close();
        return ret;
      }

      console.log(e);
      ret.message = e;
    }
  
    await client.close();
    return ret;
  }
  
//#endregion

//#region Get a user's relationships API endpoint

app.get('/users/:userId/relationships', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await getRelationships(req.params.userId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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

    for(let i = 0; i < ret.results.length; i++){
      var id = ret.results[i].id;
      var user = await db.collection("users").findOne({ _id: ObjectId(id) });
      var username = user.username;
      ret.results[i].username = username;
    }

  } catch (e) {
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region get user's friends API endpoint 

app.get('/users/:userId/friends', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await getFriends(req.params.userId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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
    var query;

    if (exists)
    {
      ret.results = [];
      for (var i = 0; i < exists.relationships.length; i++)
      {
        if (exists.relationships[i].friend)
        {
          query = await db.collection("users").findOne({ _id: ObjectId(exists.relationships[i].id) }); 
          ret.results.push({
            id: exists.relationships[i].id,
            firstName: query.firstName,
            lastName: query.lastName,
            username: query.username,
            totalLikes: query.totalLikes
          });
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
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region search user's friends based on keyword API endpoint

app.get("/users/:userId/searchFriends/:keyword", (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await searchForFriends(req.params.userId, req.params.keyword);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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

  try {
    var user = await db.collection("users").findOne({ _id: ObjectId(userId) });
    var resultsCheck = [];
    var personId;

    if (user) // If user exists in db
    {
      // Find all users that have [keyword] for at least one of their attributes/fields
      var resultsCheck = [];
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
              delete results[i].relationships;
              delete results[i].isVerified;
              delete results[i].email;
              delete results[i].likedPosts;
              ret.results.push(results[i]);
            }
          }
        }

        ret.message = `${ret.results.length} friend(s) found with keyword = ${keyword}`;
      }
      else
      {
        ret.message = `0 friend(s) found with keyword = ${keyword}`;
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
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region search user's blocked list based on keyword API endpoint

app.get("/users/:userId/searchBlocked/:keyword", (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await searchForBlocked(req.params.userId, req.params.keyword);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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

  try {
    var user = await db.collection("users").findOne({ _id: ObjectId(userId) });
    var resultsCheck = [];
    var personId;

    if (user) // If user exists in db
    {
      // Find all users that have [keyword] for at least one of their attributes/fields
      var resultsCheck = [];
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
              delete results[i].relationships;
              delete results[i].isVerified;
              delete results[i].email;
              delete results[i].likedPosts;
              ret.results.push(results[i]);
            }
          }
        }

        ret.message = `${ret.results.length} blocked user(s) found with keyword = ${keyword}`;
      }
      else
      {
        ret.message = `0 blocked user(s) found with keyword = ${keyword}`;
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
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region get user's blocked API endpoint 

app.get('/users/:userId/blocked', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await getBlocked(req.params.userId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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
    var query;

    if (exists)
    {
      ret.results = [];
      for (var i = 0; i < exists.relationships.length; i++)
      {
        if (exists.relationships[i].blocked)
        {
          query = await db.collection("users").findOne({ _id: ObjectId(exists.relationships[i].id) }); 
          ret.results.push({
            id: exists.relationships[i].id,
            firstName: query.firstName,
            lastName: query.lastName,
            username: query.username,
            totalLikes: query.totalLikes
          });
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
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }
    
    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region add friend API endpoint

app.post('/users/:userId/addFriend/:friendId', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await addFriend(req.params.userId, req.params.friendId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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
    var check1;
    var check2;
  
    check1 = await checkId(userId, "user");
    check2 = await checkId(friendId, "user");
    if (!(check1.message == ""))
    {
      ret = check1;
      await client.close();
      return ret;
    }
    else if (!(check2.message == ""))
    {
      ret = check2;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Delete Friend API endpoint 

app.post('/users/:userId/unfriend/:friendId', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await deleteFriend(req.params.userId, req.params.friendId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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
    var check1;
    var check2;
  
    check1 = await checkId(userId, "user");
    check2 = await checkId(friendId, "user");
    if (!(check1.message == ""))
    {
      ret = check1;
      await client.close();
      return ret;
    }
    else if (!(check2.message == ""))
    {
      ret = check2;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region block user API endpoint

app.post('/users/:userId/block/:blockedId', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await blockUser(req.params.userId, req.params.blockedId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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
      id: blockedId.toString(),
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
    var check1;
    var check2;
  
    check1 = await checkId(userId, "user");
    check2 = await checkId(blockedId, "user");
    if (!(check1.message == ""))
    {
      ret = check1;
      await client.close();
      return ret;
    }
    else if (!(check2.message == ""))
    {
      ret = check2;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region unblock user API endpoint 

app.post('/users/:userId/unblock/:blockedId', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await unblockUser(req.params.userId, req.params.blockedId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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
            break;
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
    var check1;
    var check2;
  
    check1 = await checkId(userId, "user");
    check2 = await checkId(blockedId, "user");
    if (!(check1.message == ""))
    {
      ret = check1;
      await client.close();
      return ret;
    }
    else if (!(check2.message == ""))
    {
      ret = check2;
      await client.close();
      return ret;
    }

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
      res.status(400).json(ret);
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
      res.status(400).json(ret);
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
      res.status(400).json(ret);
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

app.post('/posts/:userId', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});

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
    var ret = await createPost(req.params.userId, post);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
    }

  })();
});

async function createPost(userId, postObject) {
  // establish db connection
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    "success": false,
    "message": "",
    "results": {}
  }

  try {
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today  = new Date();

    // Search for the user
    var user = await db.collection("users").findOne({ _id: ObjectId(userId) });
    if (!user)
    {
      ret.success = true;
      ret.message = `No user found with id = ${friendId}`;
      await client.close();
      return ret;
    }
    delete user.email;
    delete user.isVerified;
    delete user.password;
    delete user.totalLikes;
    delete user.relationships;
    delete user.likedPosts;

    // Search for song 
    var song = null;
    try {
      song = await db.collection("songs").findOne({ _id: ObjectId(postObject.song) });
    }
    catch {
      song = null;
    }
    finally {
      if (!song)
      {
        song = await db.collection("songs").findOne({ title: postObject.song });
        if (!song)
        {
          song = await db.collection("songs").findOne({ artist: postObject.song });
          if (!song)
          {
            song = await db.collection("songs").findOne({ album: postObject.song });
            if (!song)
            {
              ret.success = true;
              ret.message = `Could find not a song with keyword = ${song}`;
              await client.close();
              return ret;
            }
          }
        }
      }
    }

    let postId = await db.collection("posts").insertOne({
      creator: user, // creator Object
      message: postObject.message,
      song: song, // song Object
      likes: 0,
      likedBy: [],
      updatedAt: today.toLocaleDateString("en-US", options)
    });

    var post = await db.collection("posts").findOne({ _id: postId.insertedId });

    ret.success = true;
    ret.message = "Successfully created post.";
    ret.results = post;

  }
  catch (e) {
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Delete post API endpoint

app.delete("/posts/:postId", (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await deletePost(req.params.postId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
    }

  })();
});

async function deletePost(postId) {
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    post = await db.collection("posts").findOne({ _id: ObjectId(postId) });
    
    if (post) // if post exists in db
    {
      // Delete post
      await db.collection("posts").deleteOne({ _id: ObjectId(postId) });
      ret.message = "Successfully deleted post.";
      ret.results = 0;
    }
    else
    {
      ret.message = "Post does not exist.";
      ret.results = 1;
    }
    ret.success = true;

  } catch (e) {
    var check = await checkId(postId, "post");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region like post API endpoint

app.post('/users/:userId/like/:postId', (req, res) => {
  // const val = authenticateToken(req, res);

  // if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await likePost(req.params.userId, req.params.postId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
    }

  })();
});

async function likePost(userId, postId) {
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    // Check if user and post exists in db
    var user = await db.collection("users").findOne({ _id: ObjectId(userId) });
    var post = await db.collection("posts").findOne({ _id: ObjectId(postId) });
    var likedPost = false;

    if (user) // if user exists in db
    {
      if (post) // if post exists in db
      {
        // Check to see whether user has already liked the post
        for (var i = 0; i < post.likedBy.length; i++)
        {
          // If user has already liked the post...
          if ((userId == post.likedBy[i]))
          {
            likedPost = true;
            break;
          }
        }

        // If user has not liked the post: push userId into likedBy array,
        // increment song's likes by 1, creator's totalLikes by 1, post's likes by 1,
        // then lastly add the post ID to the user's likedPosts array
        if (!likedPost)
        {
          // Add user to post's likedBy array
          await db.collection("posts").updateOne(
            post, 
            {$push:{likedBy: userId}}
          );

          // Increment song's likes
          await db.collection("songs").updateOne(
            {_id: ObjectId(post.song._id)},
            {$inc: {"likes": 1}}
          );

          // Increment creator's likes
          await db.collection("users").updateOne(
            {_id: ObjectId(post.creator._id)},
            {$inc: {"totalLikes": 1}}
          );

          // Increment post's likes
          await db.collection("posts").updateOne(
            {_id: ObjectId(post._id)},
            {$inc: {"likes": 1}}
          );

          // Add the post ID to the user's likedPosts array
          await db.collection("users").updateOne(
            {_id: ObjectId(userId)},
            {$push:{"likedPosts": (post._id).toString()}}
          );

          // Obtain new creator and song objects
          var creator = await db.collection("users").findOne({ _id: ObjectId(post.creator._id) });
          var song    = await db.collection("songs").findOne({ _id: ObjectId(post.song._id) });

          // Remove sensitive information about the creator
          delete creator.password;
          delete creator.relationships;
          delete creator.isVerified;
          delete creator.email;
          delete creator.likedPosts;
          delete creator.totalLikes;
  
          // Update the post in the db
          await db.collection("posts").updateOne(
            {_id: ObjectId(post._id)},
            {$set:
              {
                creator: creator,
                song: song
              }
            }
          );

          ret.message = `Successfully liked post.`;
        }
        else
        {
          ret.message = `Already liked post.`;
        }
      }
      else
      {
        ret.message = `No post found with id = ${postId}`;
      }
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
    }
    ret.success = true;
  } catch (e) {
    var check1;
    var check2;

    check1 = await checkId(userId, "user");
    check2 = await checkId(postId, "post");
    if (!(check1.message == ""))
    {
      ret = check1;
      await client.close();
      return ret;
    }
    else if (!(check2.message == ""))
    {
      ret = check2;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region unlike post API endpoint

app.post('/users/:userId/unlike/:postId', (req, res) => {
  // const val = authenticateToken(req, res);

  // if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await unlikePost(req.params.userId, req.params.postId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
    }

  })();
});

async function unlikePost(userId, postId) {
  await client.connect();
  db = client.db("TuneTables");
  var ObjectId = require('mongodb').ObjectId;

  var ret = {
    success: false,
    message: "",
    results: {}
  }

  try {
    // Check if user and post exists in db
    var user = await db.collection("users").findOne({ _id: ObjectId(userId) });
    var post = await db.collection("posts").findOne({ _id: ObjectId(postId) });
    var likedPost = false;

    if (user) // if user exists in db
    {
      if (post) // if post exists in db
      {
        // Check to see whether user has previously liked the post
        for (var i = 0; i < post.likedBy.length; i++)
        {
          // If user has already liked the post...
          if ((userId == post.likedBy[i]))
          {
            likedPost = true;
            break;
          }
        }

        // If user has liked the post: pull userId from likedBy array,
        // decrement song's likes by 1, creator's totalLikes by 1, post's likes by 1,
        // pull post ID from the user's likedPosts array
        if (likedPost)
        {
          // Pull user from post's likedBy array
          await db.collection("posts").updateOne(
            post, 
            {$pull:{likedBy: userId}}
          );

          // Decrement song's likes
          await db.collection("songs").updateOne(
            {_id: ObjectId(post.song._id)},
            {$inc: {"likes": -1}}
          );

          // Decrement creator's likes
          await db.collection("users").updateOne(
            {_id: ObjectId(post.creator._id)},
            {$inc: {"totalLikes": -1}}
          );

          // Decrement post's likes
          await db.collection("posts").updateOne(
            {_id: ObjectId(post._id)},
            {$inc: {"likes": -1}}
          );

          // Pull post ID from the user's likedPosts array
          await db.collection("users").updateOne(
            {_id: ObjectId(userId)},
            {$pull:{"likedPosts": (post._id).toString()}}
          );

          // Obtain new creator and song objects
          var creator = await db.collection("users").findOne({ _id: ObjectId(post.creator._id) });
          var song    = await db.collection("songs").findOne({ _id: ObjectId(post.song._id) });
  
          // Remove sensitive information about the creator
          delete creator.password;
          delete creator.relationships;
          delete creator.isVerified;
          delete creator.email;
          delete creator.likedPosts;
          delete creator.totalLikes;

          // Update the post in the db
          await db.collection("posts").updateOne(
            {_id: ObjectId(post._id)},
            {$set:
              {
                creator: creator,
                song: song
              }
            }
          );

          ret.message = `Successfully unliked post.`;
        }
        else
        {
          ret.message = `Already unliked post.`;
        }
      }
      else
      {
        ret.message = `No post found with id = ${postId}`;
      }
    }
    else
    {
      ret.message = `No user found with id = ${userId}`;
    }
    ret.success = true;
  } catch (e) {
    var check1;
    var check2;

    check1 = await checkId(userId, "user");
    check2 = await checkId(postId, "post");
    if (!(check1.message == ""))
    {
      ret = check1;
      await client.close();
      return ret;
    }
    else if (!(check2.message == ""))
    {
      ret = check2;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
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
      res.status(400).json(ret);
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
      res.status(400).json(ret);
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
    var results = await db.collection("posts").find({ "creator._id": ObjectId(userId) }).toArray();

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
    var check = await checkId(userId, "user post");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Display all friend posts API endpoint

app.get('/posts/:userId/friends', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await getFriendPosts(req.params.userId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
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
          friendPosts = await db.collection("posts").find({ "creator._id": friendId }).toArray();

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
    var check = await checkId(userId, "friend post");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region Populate leaderboard with sorted posts (by likes)

app.get('/posts/:userId/leaderboard', (req, res) => {
  const val = authenticateToken(req, res);

  if(val != 1) return res.status(403).json({error: "Invalid Token"});
  (async () => {
    var ret = await getSortedPosts(req.params.userId);

    if(ret.success)
    {
      res.status(200).json(ret);
    }
    else
    {
      res.status(400).json(ret);
    }
  })();
});

async function getSortedPosts(userId) {
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

      //Populate the users posts first
      userPosts = await db.collection("posts").find({ "creator._id": ObjectId(userId) }).toArray();
      results = results.concat(userPosts);
      console.log(results);

      // Iterate through user's relationship array
      for (var i = 0; i < user.relationships.length; i++)
      {
        // If relationship is a frendship...
        if (user.relationships[i].friend)
        {
          // Get friend's ID
          friendId = ObjectId(user.relationships[i].id);

          // Query all posts that have a creator ID of friendId
          friendPosts = await db.collection("posts").find({ "creator._id": friendId }).toArray();

          // Add posts to results
          results = results.concat(friendPosts);
        }
      }

      if (results.length != 0)
      {
        results.sort(function(a, b) {
          return a.likes - b.likes;
        });
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
    var check = await checkId(userId, "user");
    if (!(check.message == ""))
    {
      ret = check;
      await client.close();
      return ret;
    }

    console.log(e);
    ret.message = e;
  }

  await client.close();
  return ret;
}

//#endregion

//#region helper function: check whether an ID is valid/invalid

async function checkId(id, idName) {
  var input = id.toString();

  var ret = {
    success: false,
    message: "",
    results: []
  }

  // Check if id length is valid
  if (input.length != 24)
  {
    ret.success = true;
    ret.message = `No ${idName} found with id = ${id}.
      \nCause: invalid input string length (expected: 24; received: ${input.length})`;
    return ret;
  }
  // Check if all characters in id are hex values
  else
  {
    var char;
    for (var i = 0; i < input.length; i++)
    {
      char = parseInt(`0x${input.charAt(i)}`, 16); // if input.charAt(i) is not hex, char will be NaN
      if ((char <= 15 && char >= 0))
      {
        continue;
      }
      else
      {
        ret.success = true;
        ret.message = `No ${idName} found with id = ${id}.
          \nCause: invalid input string value (expected: hex value from 0x0 - 0xF; received: id.charAt(${i}) = ${(input.charAt(i))}`;
        return ret;
      }
    }
  }

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