// app.js
const express = require("express");

const app = express();
const logger = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");

module.exports = app;

app.use(logger("tiny"));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(bodyParser.json());

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

//START ENDPOINTS
//TEST ONLY for posting a user. Error output will ALWAYS be empty
app.post("/users", (req, res) => {
  const { userId } = req.body;
  var error = "";
  var ret = { error: error };
  res.status(200).json(ret);
});
//END ENDPOINTS
