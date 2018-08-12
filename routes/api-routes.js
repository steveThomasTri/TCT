var connection = require("../config/connection.js");
var bcrypt = require("bcrypt");
var aes256 = require('aes256');
var async = require("async");

module.exports = function (app) {
    //Functions
    function registerTournament(tournamentData, cb) {
        var td = tournamentData;

        //Insert tournament ID
        td.tournamentid = "";
        for (var k = 0; k < 7; k++) {
            td.tournamentid += Math.floor(Math.random() * (10));
        }

        var ev = tournamentData.events;
        delete td.events;
        connection.query("INSERT INTO tournaments SET ?", td, function (err, results) {
            cb(ev, td.code);
        });
    }

    function registerPlayer(playerData, cb) {
        connection.query("SELECT code from tournaments where tournamentid=?", playerData.playerdata.code, function (err, results) {
            bcrypt.hash(playerData.playerdata.password, 10).then(function (hash) {
                playerData.playerdata.code = results[0].code;
                playerData.playerdata.password = hash;
                var string = JSON.stringify(playerData.playerdata2);
                var encrypted = aes256.encrypt(key, string);
                playerData.playerdata.infosens = encrypted;
                playerData.playerdata.playerid = "";
                for (var k = 0; k < 10; k++) {
                    playerData.playerdata.playerid += Math.floor(Math.random() * (10));
                }
                cb(playerData.playerdata);
            });
        });
    }

    function verifas(email, password, cb) {
        connection.query("Select password from bouncerlist where email=?", [email], function (err, results) {
            cb(results[0].password);
        })
    }

    app.post("/api/verify", function (req, res) {
        verifas(req.body.email, req.body.password, function (data) {
            bcrypt.compare(req.body.password, data).then(function (resh) {
                if (resh) {
                    res.json("YES");
                } else {
                    res.json("NO");
                }
            });
        });
    });

    app.post("/api/tournamentdata", function (req, res) {
        registerTournament(req.body, function (data, data2) {
            var querynumerator = 0;
            async.each(data, function (game, callback) {
                connection.query("INSERT INTO games (game, code) VALUES (?,?)", [game, data2], function (err, results) {
                    if (err) throw err;
                    querynumerator++;
                    callback();
                });
            }, function (err) {
                if (err) {
                    console.log('A file failed to process');
                } else {
                    console.log('All queries are inserted');
                    res.json({ code: data2 });
                }
            });
        });
    });

    app.post("/api/playerregister", function (req, res) {
        registerPlayer(req.body, function (data) {
            connection.query("INSERT INTO players SET ?", data, function (err, result) {
                console.log(result.affectedRows);
                if (result.affectedRows == 1) {
                    res.json(true);
                } else {
                    res.json(false);
                }
            });
        });
    })

    app.put("/api/updategamesdata", function (req, res) {
        var querynumerator = 0;
        async.each(req.body.gamesData, function (game, callback) {
            connection.query("UPDATE games SET MTP=?, AAV=?, description=? WHERE game=? AND code=?", [game.MTP, game.MTP, game.description, game.game, req.body.code], function (err, results) {
                if (err) throw err;
                querynumerator++;
                callback();
            });
        }, function (err) {
            if (err) {
                console.log('A file failed to process');
            } else {
                res.json({ "message": "congratz" });
            }
        });
    });
}