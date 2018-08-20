var connection = require("../config/connection.js");
var bcrypt = require("bcrypt");
var aes256 = require('aes256');
var async = require("async");

module.exports = function (app, passport) {
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/');
    }
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
            // cb(ev, td.code);
            if (err) throw err;
            var status = { tournament_id: results.insertId, isclosed: false };
            var fk = results.insertId;

            connection.query("INSERT INTO tournament_status SET ?", status, function (err, resul) {
                cb(ev, fk, td.code);
            });

        });
    }

    function registerPlayer(playerData, cb) {
        connection.query("SELECT code from tournaments where tournamentid=?", playerData.playerdata3.code, function (err, results) {
            bcrypt.hash(playerData.playerdata.password, 10).then(function (hash) {
                playerData.playerdata.code = results[0].code;
                playerData.playerdata.password = hash;
                var string = JSON.stringify(playerData.playerdata2);
                var encrypted = aes256.encrypt(process.env.AESKEY, string);
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

    function verifas2(username, password, cb) {
        connection.query("Select password from registration where username=?", [username], function (err, results) {
            if (results.length > 0) {
                cb(results[0].password);
            } else {
                cb("dummypassword");
            }
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

    app.post('/api/verify_player', passport.authenticate('local-login', {
        successRedirect: '/playerhq', // redirect to the secure profile section
        failureRedirect: '/playerhqlogin', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }),
        function (req, res) {
            console.log("hello");

            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

    app.post("/api/tournamentdata", function (req, res) {
        registerTournament(req.body, function (data, data2, data3) {
            var querynumerator = 0;
            async.each(data, function (game, callback) {
                connection.query("INSERT INTO games (game, tournament_id) VALUES (?,?)", [game, data2], function (err, results) {
                    if (err) throw err;
                    querynumerator++;
                    console.log(querynumerator);
                    callback();
                });
            }, function (err) {
                if (err) {
                    console.log('A file failed to process');
                } else {
                    console.log('All queries are inserted');
                    res.json({ code: data3 });
                }
            });
        });
    });

    app.post("/api/playerregister", function (req, res) {
        registerPlayer(req.body, function (data) {
            var code = data.code;
            delete data.code;
            var k;
            connection.query("INSERT INTO registration SET ?", data, function (err, result) {
                if (result.affectedRows == 1) {
                    k = result.insertId;
                    connection.query("INSERT INTO stats SET ?", { player_id: k }, function (err, result2) {
                        connection.query("INSERT INTO messages SET ?", { player_id: k, message: "Welcome to TCT" }, function (err, results3) {
                            if (results3.affectedRows == 1) {
                                connection.query("SELECT id from tournaments where code = ?", code, function (err, result4) {
                                    var tcode = result4[0].id;
                                    connection.query("INSERT INTO players (player_id, tournament_id) VALUES (?,?)", [k, result4[0].id], function (err, result6) {
                                        connection.query("SELECT id from games where tournament_id = ?", tcode, function (err, result5) {
                                            var games = result5;
                                            var querynumerator = 0;

                                            async.each(games, function (game, callback) {
                                                connection.query("INSERT INTO game_ratings (player_id, game_id) VALUES (?,?)", [k, game.id], function (err, results) {
                                                    if (err) throw err;
                                                    querynumerator++;
                                                    console.log(querynumerator);
                                                    callback();
                                                });
                                            }, function (err) {
                                                if (err) {
                                                    console.log('A file failed to process');
                                                } else {
                                                    console.log('All queries are inserted');
                                                    res.json(true);
                                                }
                                            });
                                        });
                                    });
                                });
                            } else {
                                res.json(false);
                            }
                        });
                    });
                } else {
                    res.json(false);
                }
            });
        });
    })

    app.put("/api/updategamesdata", function (req, res) {
        var querynumerator = 0;
        async.each(req.body.gamesData, function (game, callback) {
            connection.query("UPDATE games SET MTP=?, AAV=?, description=? WHERE game=? AND tournament_id=(SELECT id from tournaments where code=?)", [game.MTP, game.MTP, game.description, game.game, req.body.code], function (err, results) {
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

    app.put("/api/updategameratings", function (req, res) {
        var querynumerator = 0;
        async.each(req.body.gamesData, function (game, callback) {
            connection.query("UPDATE game_ratings SET rating=? WHERE id=?", [game.rating, game.game_id], function (err, results) {
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

    app.post("/api/fasttrack/:ID", function (req, res) {
        connection.query("SELECT id, firstname, lastname, username from registration where playerid=?", req.params.ID, function (err, result) {
            if (result.length == 1) {
                res.json(result[0]);
            } else {
                res.json("false");
            }
        })
    })

    app.post("/api/fasttrack/:PID/:TID", function (req, res) {
        connection.query("SELECT id FROM tournaments where tournamentid=?", req.params.TID, function (err, result) {
            if (err) throw err;
            if (result.length == 1) {
                var tid = result[0].id;

                connection.query("INSERT INTO players (player_id, tournament_id) VALUES (?,?)", [req.params.PID, tid], function (err, results2) {
                    if (err) throw err;

                    connection.query("INSERT INTO messages (player_id, message) VALUES (?,?)", [req.params.PID, req.params.TID], function (err, result3) {
                        if (err) throw err;
                        if (result3.affectedRows == 1) {
                            //res.json(true);
                            connection.query("SELECT id from games where tournament_id = ?", tid, function (err, result5) {
                                var games = result5;
                                var querynumerator = 0;

                                async.each(games, function (game, callback) {
                                    connection.query("INSERT INTO game_ratings (player_id, game_id) VALUES (?,?)", [req.params.PID, game.id], function (err, results) {
                                        if (err) throw err;
                                        querynumerator++;
                                        console.log(querynumerator);
                                        callback();
                                    });
                                }, function (err) {
                                    if (err) {
                                        console.log('A file failed to process');
                                    } else {
                                        console.log('All queries are inserted');
                                        res.json(true);
                                    }
                                });
                            });
                        } else {
                            res.json(false);
                        }
                    })
                })
            }
        })
    })
}
