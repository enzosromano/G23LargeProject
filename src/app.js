// app.js
const express = require("express");

const app = express();
const logger = require("morgan");
const path = require("path");

module.exports = app;

app.use(logger("tiny"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});
