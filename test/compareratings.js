var connection = require("../config/connection.js");
var async = require("async");

// var player1 = process.argv[3];
// var player2 = process.argv[4];

var tid = process.argv[2];

var round = process.argv[3];

var compared = [];

connection.query("SELECT id from games where tournament_id = ? LIMIT 1", [tid], function (err, result) {
  connection.query("SELECT id, player1, player2 from tournament_pairings where round = ? and tournament_id = ?", [round, result[0].id], function (err, result2) {
    async.each(result2, function (pairing, callback) {
      connection.query("SELECT games.game, game_ratings.game_id, game_ratings.rating from games join game_ratings on games.id=game_ratings.game_id where player_id = ?", [pairing.player1], function (err, result3) {
        connection.query("SELECT games.game, game_ratings.game_id, game_ratings.rating from games join game_ratings on games.id=game_ratings.game_id where player_id = ?", [pairing.player2], function (err, result4) {


          for (var i = 0; i < result3.length; i++) {
            result3[i].difference = Math.abs(result3[i].rating - result4[i].rating)
            result3[i].avg = (result3[i].rating + result4[i].rating) / 2;
          }

          result3.sort(function (a, b) { return a.difference - b.difference || b.avg - a.avg });
          //compared.push(result3);
          compared.push({player1:pairing.player1,player2:pairing.player2,result:result3})
          callback();
        });
      })
    }, function (err) {
      if (err) {
        console.log('A file failed to process');
      } else {
        console.log('All queries are inserted');
        console.log(compared);
      }
    });
  });
});
