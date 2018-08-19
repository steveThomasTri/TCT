var connection = require("../config/connection.js");
var aes256 = require('aes256');

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
        connection.query("SELECT name, date, maxnum, location, tournamentid FROM tournaments", function (err, results) {
            if (err) throw err;
            res.render("tournaments", { tournaments: results });
        })
    });

    app.get("/tournaments/:code", function(req, res){
        connection.query("SELECT name, tournamentid from tournaments where tournamentid=?", req.params.code, function(err, result){
            if (result.length == 1){
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

    app.get('/playerhq', isLoggedIn, function(req, res) {
  		res.render('playerhq', {
  			user : req.user // get the user out of session and pass to template
  		});
      });
      
    app.get("/playerhq_personalinfo", isLoggedIn, function(req, res){
        connection.query("SELECT infosens from registration where id=?", req.user.id, function(err, result){
            var decrypted = aes256.decrypt(process.env.AESKEY, result[0].infosens);
            res.render('playerhq_personalnfo', JSON.parse(decrypted));
        })
    });

    app.get("/playerhq_skillrating/:tid", isLoggedIn, function(req, res){
        connection.query("SELECT id from tournaments where tournamentid = ?", req.params.tid, function(err, result){
            connection.query("select game_ratings.id,game_ratings.player_id,game_ratings.game_id,game_ratings.rating, games.game, games.description from game_ratings join games on game_ratings.game_id=games.id where tournament_id=? and player_id=?", [result[0].id, req.user.id], function(err,result2){
                var allgames = [];
                var pointer = 0;
                while (pointer < result2.length - 1){
                    var page = [];
                    for (var i = 0; i < 10; i++){
                        page.push(result2[pointer]);
                        if (pointer == result2.length - 1) break;
                        pointer++;
                    }
                    allgames.push(page);
                }
                res.render("playerhq_skillrating", {games:allgames,user:req.user});
            })
        })
    });

    app.get("/playerhqlogin", function(req, res){
      res.render("playerhqlogin", {})
    });

    app.get("/logout", function(req, res){
        req.logout();
        res.redirect("/mainmenu");
    })
}
