var fs = require('fs');
var CsvReadableStream = require('csv-reader');
var bcrypt = require('bcrypt');
var aes256 = require('aes256');
var mysql = require('mysql');
require('dotenv').config();

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
    connection.query("INSERT INTO players set ?", data3[0], function (err, results) {
        console.log(results.affectedRows);
    });
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

        insertPlayer(playerData, aes);

    })
    .on('end', function (data) {
        console.log('No more rows!');
    });