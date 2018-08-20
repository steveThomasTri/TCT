var connection = require("../config/connection.js");
var async = require("async");

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
        });
    }, function (err) {
        if (err) {
            console.log('A file failed to process');
        } else {
            connection.query("DELETE FROM registration where verified = 0", function(err, resul2){
                console.log("Players Deleted: " + resul2.affectedRows);
            })
        }
    });
});
