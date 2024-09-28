const express = require("express");

const { readFileSync } = require("fs");
const path = require("path");

const app = express();

const indexFile = readFileSync(path.join(__dirname, "index.html"), "utf-8");

app.get("/", async (req, res) => {
  console.log("got request");
  res.sendFile(path.join(__dirname, "index.html"));
});

module.exports = app;
