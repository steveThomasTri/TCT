var connection = require("../config/connection.js");
var async = require("async");

connection.query("SELECT * from registration where verified = 0", function(err, result){
  var players = result;
  var deletedplayers = 0;

  async.each(players, function (player, callback) {
        connection.query("UPDATE registration SET verified = 1 where id=?", [player.id], function(err, resu){
          if (err) throw err;
        });
  }, function (err) {
      if (err) {
          console.log('A file failed to process');
      } else {
          console.log('All queries are inserted');
          console.log("Players Deleted: " + deletedplayers);
      }
  });
});
