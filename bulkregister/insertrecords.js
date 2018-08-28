var fs = require('fs');
var CsvReadableStream = require('csv-reader');
var bcrypt = require('bcrypt');
var aes256 = require('aes256');
var mysql = require('mysql');
var async = require("async");
require('dotenv').config();

var rows = 0;
var numplayers = 0;

//MySQL conection
var connection = require("../config/connection.js")
var inputStream = fs.createReadStream('bulkregister/my.csv', 'utf8');

function insertPlayer(data, cb) {
    bcrypt.hash(data[0].password, 10).then(function (hash) {
        data[0].password = hash;
        cb(data, inserter);
    });
}

function aes(data2, cb) {
    var string = JSON.stringify(data2[1]);
    var encrypted = aes256.encrypt("cicada3301", string);
    data2[0].infosens = encrypted;
    cb(data2);
}

function inserter(data3) {
    var code = data3[0].code;
    delete data3[0].code;
    var k;
    try {
        connection.query("INSERT INTO registration set ?", data3[0], function (err, results) {
            if (err) throw err;
            k = null;
            k = results.insertId;
            if (k !== null) {
                connection.query("INSERT INTO stats SET ?", { player_id: k }, function (err, results2) {
                    connection.query("INSERT INTO messages SET ?", { player_id: k, message: "Welcome to TCT" }, function (err, result3) {
                        connection.query("SELECT id from tournaments where code = ?", code, function (err, result4) {
                            var tcode = result4[0].id;

                            connection.query("INSERT INTO players (player_id, tournament_id) VALUES (?,?)", [k, result4[0].id], function (err, result6) {
                                connection.query("SELECT id from games where tournament_id = ?", tcode, function (err, result7) {
                                    var games = result7;
                                    var querynumerator = 0;

                                    async.each(games, function (game, callback) {
                                        connection.query("INSERT INTO game_ratings (player_id, game_id) VALUES (?,?)", [k, game.id], function (err, results8) {
                                            if (err) throw err;
                                            querynumerator++;
                                            if (querynumerator == games.length) {
                                                numplayers++;
                                                if (numplayers == rows) {
                                                    connection.end()
                                                }
                                            }
                                        });
                                    }, function (err) {
                                        if (err) {
                                            console.log('A file failed to process');
                                        } else {
                                            console.log('All queries are inserted');
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    } catch (err) {
        console.log("duplicate")
    }
}

inputStream
    .pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
    .on('data', function (row) {
        var playerData = [{
            firstname: row[0],
            lastname: row[1],
            dateofbirth: row[2],
            email: row[3],
            username: row[4],
            password: row[5],
            infosens: "",
            playerid: row[9],
            code: row[10]
        }, { phonenumber: row[8], ssn: row[7], address: row[6] }]

        rows++;
        insertPlayer(playerData, aes);

    })
    .on('end', function (data) {
        console.log('No more rows!');
    });