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
