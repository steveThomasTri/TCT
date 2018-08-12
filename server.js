//Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var keys = require("./keys/keys.js");

//Keys
var key = keys.aeskey;

//App
var app = express();

//Port
var PORT = process.env.PORT || 3000;

//Middleware
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//MySQL connection
var connection = require("./config/connection.js");

//routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

//Listener
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
