var connection = require("../config/connection.js");
var async = require("async");

function getRandomInt(min,max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

connection.query("SELECT id from game_ratings", function(err, result){
  var players = result;
  async.each(players, function (player, callback) {
      connection.query("UPDATE game_ratings SET rating = ? where id=?", [getRandomInt(1,10),player.id], function(err, resu){
        if (err) throw err;
        callback();
      });
  }, function (err) {
      if (err) {
          console.log('A file failed to process');
      } else {
          console.log('All skill ratings are updated');
      }
  });
});
