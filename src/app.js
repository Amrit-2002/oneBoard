const express = require("express");

const { readFileSync } = require("fs");
const path = require("path");

const app = express();

// const indexFile = readFileSync(path.join(__dirname, "index.html"), "utf-8");

app.set("view engine", "ejs"); // set ejs as template engine
app.set("views", path.join(__dirname, "views")); // set the directory to look to serve for ejs

app.get("/", async (req, res) => {
  console.log("got request");
  //   res.sendFile(path.join(__dirname, "board.html"));
  res.render("pages/index");
});

app.get("/board", async (req, res) => {
  //   res.sendFile(path.join(__dirname, "board.html"));
  res.render("pages/board");
});

module.exports = app;
