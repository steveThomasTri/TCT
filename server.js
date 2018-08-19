//Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
require('dotenv').config();

var session = require('express-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');

require('./config/passport')(passport);

//App
var app = express();

//Port
var PORT = process.env.PORT || 3000;

//Middleware
app.engine("handlebars", exphbs({
	defaultLayout: "main", helpers: {
		pagination: function (from, to, block) {
			var accum = '';
			for (var i = from; i < to + 1; i++) {
				accum += block.fn(i);
			}
			return accum;
		}
	}
}));
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session());

//MySQL connection
var connection = require("./config/connection.js");

//routes
require("./routes/html-routes.js")(app, passport);
require("./routes/api-routes.js")(app, passport);

//Listener
app.listen(PORT, function () {
	console.log("App listening on PORT " + PORT);
});
