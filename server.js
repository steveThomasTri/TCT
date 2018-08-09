//Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bcrypt = require("bcrypt");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var async = require("async");

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

//MySQL conection

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


function registerTournament(tournamentData, cb){
  var td = tournamentData;
  var ev = tournamentData.events;
  delete td.events;
  connection.query("INSERT INTO tournaments SET ?", td, function(err, results){
    cb(ev, td.code);
  });
}

function verifas(email, password, cb){
  connection.query("Select password from bouncerlist where email=?",[email], function(err, results){
    cb(results[0].password);
  })
}

//Routes
app.get("/", function(req, res){
  res.render("splash", {});
});

app.get("/mainmenu", function(req, res){
  res.render("mainmenu", {});
});

app.get("/tournamentinfo", function(req, res){
  res.render("tournamentinfo", {});
});

app.get("/tournaments", function(req, res){
  connection.query("SELECT name, date, maxnum, location, tournamentid FROM tournaments", function(err, results){
    if (err) throw err;

    res.render("tournaments", {tournaments:results});
  })
})

app.get("/setactivities/:code", function(req, res){
  connection.query("SELECT id, game, description, MTP from games where code=?",req.params.code, function(err,results){
    if (err) throw err;

    res.render("setactivities", {games:results});
  });
});

app.get("/congratulations", function(req, res){
  res.render("congratulations", {});
})

app.post("/api/verify", function(req, res){
    verifas(req.body.email,req.body.password,function(data){
      bcrypt.compare(req.body.password, data).then(function(resh) {
          if (resh){
            res.json("YES");
          } else {
            res.json("NO");
          }
      });
    });
});

app.post("/api/tournamentdata", function(req, res){
  registerTournament(req.body, function(data, data2){

    var querynumerator = 0;
    async.each(data, function(game, callback){
      connection.query("INSERT INTO games (game, code) VALUES (?,?)", [game,data2], function(err, results){
        if (err) throw err;
        querynumerator++;
        console.log(querynumerator);
        callback();
      });
    }, function(err){
      if(err) {
        console.log('A file failed to process');
      } else {
        console.log('All queries are inserted');
        res.json({code:data2});
      }
    });

  });
});

app.put("/api/updategamesdata", function(req, res){
  console.log(req.body);
  //update the data

  var querynumerator = 0;
    async.each(req.body.gamesData, function(game, callback){
      console.log(game.game);
      console.log(game.MTP);
      console.log(game.description);
      console.log(req.body.code);
      connection.query("UPDATE games SET MTP=?, AAV=?, description=? WHERE game=? AND code=?", [game.MTP, game.MTP, game.description, game.game, req.body.code], function(err, results){
        if (err) throw err;
        querynumerator++;
        console.log(querynumerator);
        callback();
      });
    }, function(err){
      if(err) {
        console.log('A file failed to process');
      } else {
        console.log('All games are updated');
        res.json({"message":"congratz"});
        //congratulations you have set up your tournament activities
      }
    });
})

//Listener
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
