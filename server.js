var express = require("express");
var app = express();
const http = require("http");

var path = require("path");
var bodyParser = require("body-parser");
// var main_copy = require('./main_copy');
// var run_j = require("./run");
var temp = require("./temp")

app.set("port", 3045);
// app.set("superSecret", process.env.secret); // secret variable
app.use(function (err, req, res, next) {
  res.header("Content-type: application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, session, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (err.name === "UnauthorizedError") {
    return res.status(403).send({
      success: false,
      message: "No token provided.",
    });
  }
  next();
});
//View Engine
app.set("views", path.join(__dirname, "views"));
// Set Static Folder
app.use(express.static(path.join(__dirname, "client")));
// Body Parser MW
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use("./run.js", run_j);
app.use("/temp", temp);

app.listen(app.get("port"), function () {
  console.log("server started in  port ..." + app.get("port"));
});

//run().catch(console.dir);

module.exports = app;
