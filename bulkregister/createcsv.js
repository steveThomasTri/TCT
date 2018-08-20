var rp = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs');
var csvWriter = require("csv-write-stream");
var moment = require('moment');
var mysql = require('mysql');
require('dotenv').config();

var code = process.argv[2];

//MySQL conection
var connection = require("../config/connection.js");

var options = {
    uri: `https://www.fakenamegenerator.com/advanced.php?t=country&n%5B%5D=us&c%5B%5D=us&gen=50&age-min=17&age-max=40`,
    transform: function (body) {
        return cheerio.load(body);
    }
}

var records = 0;

function bulkcsv() {
    if (records < 18) {
        rp(options)
            .then(function ($) {
                var ssn = '';
                for (var i = 1; i <= 9; i++) {
                    ssn += Math.floor(Math.random() * (10));

                    if (i == 3 || i == 5) ssn += '-';
                }

                var playerid = '';
                for (var i = 1; i <= 10; i++) {
                    playerid += Math.floor(Math.random() * (10));
                }

                if (!fs.existsSync("bulkregister/my.csv"))
                    writer = csvWriter({ headers: ["firstname", "lastname", "dateofbirth", "email", "username", "password", "address", "ssn", "phonenumber", "playerid", "code"] });
                else
                    writer = csvWriter({ sendHeaders: false });

                writer.pipe(fs.createWriteStream("bulkregister/my.csv", { flags: 'a' }));
                writer.write({
                    firstname: $("div.address h3").text().split(" ")[0],
                    lastname: $("div.address h3").text().split(" ")[2],
                    dateofbirth: moment($(".dl-horizontal dd").eq(5).html()).format("MM/DD/YYYY"),
                    email: $(".dl-horizontal dd").eq(8).html().split(" ")[0],
                    username: $(".dl-horizontal dd").eq(9).html(),
                    password: "password1234",
                    address: $("div.adr").html().trim().replace("<br>", ", "),
                    ssn: ssn,
                    phonenumber: $(".dl-horizontal dd").eq(3).html(),
                    playerid: playerid,
                    code: code
                });
                writer.end();
                records++;
                bulkcsv();
            })
            .catch(function (err) {
                console.log(err);
            })
    }
}

if (code !== undefined){
    connection.query("SELECT code from tournaments where code=?",[code], function(err,results){
        if (results.length == 1){
            bulkcsv();
        } else {
            console.log("No tournament code exists");
        }
        connection.end();
    })
} else {
    console.log("You must neter a code");
}
