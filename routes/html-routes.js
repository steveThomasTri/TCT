var connection = require("../config/connection.js");
var aes256 = require('aes256');
var async = require('async');

module.exports = function (app, passport) {
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/playerhqlogin');
    }
    //Routes
    app.get("/", function (req, res) {
        res.render("splash", {});
    });

    app.get("/mainmenu", function (req, res) {
        res.render("mainmenu", {});
    });

    app.get("/tournamentinfo", function (req, res) {
        res.render("tournamentinfo", {});
    });

    app.get("/tournaments", function (req, res) {
        connection.query("SELECT id, name, date, maxnum, location, tournamentid, (Select count(*) from players where tournament_id = tournaments.id) as registers FROM tournaments", function (err, results) {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                results[i].remaining = results[i].maxnum - results[i].registers;
            }
            res.render("tournaments", { tournaments: results });
        })
    });

    app.get("/tournaments/:code", function (req, res) {
        connection.query("SELECT name, tournamentid from tournaments where tournamentid=?", req.params.code, function (err, result) {
            if (result.length == 1) {
                res.render("tournamentgate", result[0]);
            } else {
                res.render("mainmenu", {});
            }
        })
    })

    app.get("/setactivities/:code", function (req, res) {
        connection.query("SELECT games.game, games.MTP, games.AAV, games.description, tournaments.code from games join tournaments on games.tournament_id=tournaments.id where code=?", req.params.code, function (err, results) {
            if (err) throw err;
            res.render("setactivities", { games: results });
        });
    });

    app.get("/congratulations", function (req, res) {
        res.render("congratulations", {});
    });

    app.get("/registration/:tid", function (req, res) {
        connection.query("SELECT name, tournamentid from tournaments where tournamentid=? LIMIT 1", req.params.tid, function (err, result) {
            res.render("registration", result[0]);
        });
    });

    app.get("/about", function (req, res) {
        res.render("about", {});
    });

    app.get('/playerhq', isLoggedIn, function (req, res) {
        res.render('playerhq', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get("/playerhq_personalinfo", isLoggedIn, function (req, res) {
        connection.query("SELECT infosens from registration where id=?", req.user.id, function (err, result) {
            var decrypted = aes256.decrypt(process.env.AESKEY, result[0].infosens);
            res.render('playerhq_personalnfo', JSON.parse(decrypted));
        })
    });

    app.get("/playerhq_skillrating/:tid", isLoggedIn, function (req, res) {
        connection.query("SELECT id from tournaments where tournamentid = ?", req.params.tid, function (err, result) {
            connection.query("select game_ratings.id,game_ratings.player_id,game_ratings.game_id,game_ratings.rating, games.game, games.description from game_ratings join games on game_ratings.game_id=games.id where tournament_id=? and player_id=?", [result[0].id, req.user.id], function (err, result2) {
                var allgames = [];
                var pointer = 0;
                while (pointer < result2.length - 1) {
                    var page = [];
                    for (var i = 0; i < 10; i++) {
                        page.push(result2[pointer]);
                        if (pointer == result2.length - 1) break;
                        pointer++;
                    }
                    allgames.push(page);
                }
                res.render("playerhq_skillrating", { games: allgames, user: req.user });
            })
        })
    });

    app.get("/playerhqlogin", function (req, res) {
        res.render("playerhqlogin", {})
    });

    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/mainmenu");
    });

    //compare ratings between two players TEST
    app.get("/skillcompare/:TID/:P1/:P2", function (req, res) {
        connection.query("SELECT id from games where tournament_id = ? LIMIT 1", [req.params.TID], function (err, result) {
            connection.query("SELECT * from players where player_id = ? and tournament_id = ? LIMIT 1", [req.params.P2, result[0].id], function (err, result2) {

                if (result2.length == 1) {
                    connection.query("SELECT games.game, game_ratings.game_id, game_ratings.rating, games.random from games join game_ratings on games.id=game_ratings.game_id where player_id = ?", [req.params.P1], function (err, result3) {
                        connection.query("SELECT games.game, game_ratings.game_id, game_ratings.rating, games.random from games join game_ratings on games.id=game_ratings.game_id where player_id = ?", [req.params.P2], function (err, result4) {
                            var compared = [];
                            for (var i = 0; i < result3.length; i++) {
                                result3[i].difference = Math.abs(result3[i].rating - result4[i].rating)
                                result3[i].avg = (result3[i].rating + result4[i].rating) / 2;
                            }

                            result3.sort(function (a, b) { return a.difference - b.difference || b.avg - a.avg || b.random - a.random });

                            res.render("skillcompare", { result: result3 });
                        });
                    })
                }
            });
        });
    });

    //compare ratings for all pairings
    app.get("/pairingcompare/:TID/:round", function (req, res) {
        var compared = [];
        connection.query("SELECT tournament_id from games where tournament_id = ? LIMIT 1", [req.params.TID], function (err, result) {
            connection.query("SELECT id, player1, player2 from tournament_pairings where round = ? and tournament_id = ?", [req.params.round, result[0].tournament_id], function (err, result2) {
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
                        res.render("skillcompare", { result: compared });
                    }
                });
            });
        });
    });
}
