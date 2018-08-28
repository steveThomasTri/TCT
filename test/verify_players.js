var connection = require("../config/connection.js");
var async = require("async");

var numplayers = 0;

function verifyCheck(){
    if (Math.random() >= .15){
        return 1;
    } else {
        return 0;
    }
}

connection.query("SELECT * from registration where verified = 0", function (err, result) {
    var players = result;
    var deletedplayers = 0;

    async.each(players, function (player, callback) {
        connection.query("UPDATE registration SET verified = ? where id=?", [verifyCheck(), player.id], function (err, resu) {
            if (err) throw err;
            numplayers++;
            if (numplayers == players.length){
                connection.end();
            }
        });
    }, function (err) {
        if (err) {
            console.log('A file failed to process');
        } else {

        }
    });
});