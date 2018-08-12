var connection = require("../config/connection.js");

module.exports = function (app) {
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
}