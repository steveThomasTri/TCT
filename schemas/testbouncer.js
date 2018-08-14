var bcrypt = require("bcrypt");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "amazon3210",
  database: "tct2016_"
});


connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

var name = "John Doe";
var email = "test@test.com";
var plaintext = "password"

bcrypt.hash(plaintext, 10, function(err, hash){
  connection.query("INSERT INTO bouncerlist (fullname, email, password) VALUES (?,?,?)",[name, email, hash], function(err, results){
    console.log("DONE");
  } )
});
