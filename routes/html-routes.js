var connection = require("../config/connection.js");

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
    })

    app.get("/setactivities/:code", function (req, res) {
        connection.query("SELECT id, game, description, MTP from games where code=?", req.params.code, function (err, results) {
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

    app.get("/playerhqlogin", function(req, res){
      res.render("playerhqlogin", {})
    })
}
