var connection = require("../config/connection.js");

connection.query("DELETE FROM registration where verified = 0", function (err, result) {
    console.log("Deleted Players: " + result.affectedRows);
});

connection.end();
