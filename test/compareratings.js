var connection = require("../config/connection.js");
var async = require("async");

var player1 = process.argv[3];
var player2 = process.argv[4];

var tid = process.argv[2];

connection.query("SELECT id from games where tournament_id = ? LIMIT 1", [tid], function(err, result){
  connection.query("SELECT * from players where player_id = ? and tournament_id = ? LIMIT 1", [player2, result[0].id], function(err, result2){

    if (result2.length == 1){
      connection.query("SELECT games.game, game_ratings.game_id, game_ratings.rating from games join game_ratings on games.id=game_ratings.game_id where player_id = ?", [player1], function(err, result3){
        connection.query("SELECT games.game, game_ratings.game_id, game_ratings.rating from games join game_ratings on games.id=game_ratings.game_id where player_id = ?", [player2], function(err, result4){

          var compared = [];
          for (var i = 0 ; i < result3.length; i++){
            result3[i].difference = Math.abs(result3[i].rating - result4[i].rating)
            result3[i].avg = (result3[i].rating + result4[i].rating)/2;
          }

          result3.sort(function(a,b){return a.difference - b.difference || b.avg - a.avg});
          console.log(result3)
        });
      })
    }
  });
});
