//Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bcrypt = require("bcrypt");
var bodyParser = require("body-parser");
var async = require("async");
var aes256 = require('aes256');
var keys = require("./keys/keys.js");

var key = keys.aeskey;

//var encrypted = aes256.encrypt(key, plaintext);
//var decrypted = aes256.decrypt(key, encrypted);

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

var connection = require("./config/connection.js");

//Functions
function registerTournament(tournamentData, cb){
  var td = tournamentData;

  //Insert tournament ID
  td.tournamentid = "";
  for (var k = 0; k < 7; k++){
    td.tournamentid += Math.floor(Math.random() * (10));
  }

  var ev = tournamentData.events;
  delete td.events;
  connection.query("INSERT INTO tournaments SET ?", td, function(err, results){
    cb(ev, td.code);
  });
}

function registerPlayer(playerData, cb){
  connection.query("SELECT code from tournaments where tournamentid=?", playerData.playerdata.code, function(err, results){
    bcrypt.hash(playerData.playerdata.password, 10).then(function(hash) {
        playerData.playerdata.code = results[0].code;
        playerData.playerdata.password = hash;
        var string = JSON.stringify(playerData.playerdata2);
        var encrypted = aes256.encrypt(key, string);
        playerData.playerdata.infosens = encrypted;

        playerData.playerdata.playerid = "";
        for (var k = 0; k < 10; k++){
          playerData.playerdata.playerid += Math.floor(Math.random() * (10));
        }
        cb(playerData.playerdata);
    });


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
});

app.get("/registration/:tid", function(req, res){
  connection.query("SELECT name, tournamentid from tournaments where tournamentid=? LIMIT 1", req.params.tid, function(err, result){
    res.render("registration", result[0]);
  })
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

app.post("/api/playerregister", function(req, res){


  registerPlayer(req.body, function(data){
    connection.query("INSERT INTO players SET ?", data, function(err, result){

      console.log(result.affectedRows);
      if (result.affectedRows == 1){
        res.json(true);
      } else {
        res.json(false);
      }
    });
  });

})

app.put("/api/updategamesdata", function(req, res){
  var querynumerator = 0;
    async.each(req.body.gamesData, function(game, callback){
      console.log(game.game);
      console.log(game.MTP);
      console.log(game.description);
      console.log(req.body.code);
      connection.query("UPDATE games SET MTP=?, AAV=?, description=? WHERE game=? AND code=?", [game.MTP, game.MTP, game.description, game.game, req.body.code], function(err, results){
        if (err) throw err;
        querynumerator++;
        callback();
      });
    }, function(err){
      if(err) {
        console.log('A file failed to process');
      } else {
        res.json({"message":"congratz"});
      }
    });
});

//Listener
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
