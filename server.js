/**
 * -------------- IMPORTS ----------------
 */
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser'); // Middleware
var cookieParser = require('cookie-parser');
const path = require("path");
const passport = require('passport');

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));



/**
 * -------------- VIEW ENGINE ----------------
 */
const viewsDirPath = path.join(__dirname, "views");
app.set("view engine", "ejs");
app.set("views", viewsDirPath);
// app.use(express.static(path.join(__dirname, "public")));

/**
 * -------------- ROUTES ----------------
 */
const tutorial = require("./app/routes/tutorial.routes.js");
app.use("/tutorial", tutorial);

const test = require("./app/routes/test.routes.js");
app.use("/test", test);

const auth = require("./app/routes/auth.routes.js");
app.use("/auth", auth);

app.get("/", (req, res) => {
  console.log("req.user is " + req.user);
  res.render("welcome", {
    "title": "GroShop"
  });
});

app.get("/home", (req, res) => {
  console.log("req.user is " + req.user);
  res.render("index", {
    "title": "GroShop"
  });
});



/**
 * -------------- SERVER ----------------
 */
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});