var mysql = require("mysql");

var playersarray = [];
var rounds = 15;
var currentround = 1;
var samepairings = 0;

Array.prototype.shuffle = function () {
    var input = this;
    for (var i = input.length - 1; i >= 0; i--) {

        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];

        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
}

function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for (; i < len; i++) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for (i in obj) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}

function pair(pairingarray, innerarray) {
    var readyarray = deepCopy(innerarray).shuffle();
    var l = 0;
    var pairlength = pairingarray.length;

    var m = 0;
    var playerlength = readyarray.length / 2;

    while (pairlength != l) {
        while (m != playerlength) {
            //m is 0
            //readyarray
            RAP1 = readyarray[m * 2];
            RAP2 = readyarray[m * 2 + 1];

            //get pairing array
            PAI = pairingarray[l][pairingarray[l].indexOf(RAP2)];


            if (pairingarray[l].indexOf(readyarray[m * 2]) % 2 == 0) {
                if (pairingarray[l][pairingarray[l].indexOf(readyarray[m * 2]) + 1] == readyarray[m * 2 + 1]) {
                    console.log("SAME = " + m);
                    readyarray = deepCopy(innerarray).shuffle();
                    samepairings++;
                    m = 0;
                    l = 0;
                } else { m++; }
            } else {
                if (pairingarray[l][pairingarray[l].indexOf(readyarray[m * 2]) - 1] == readyarray[m * 2 + 1]) {
                    console.log("SAME = " + m);
                    readyarray = deepCopy(innerarray).shuffle();
                    samepairings++;
                    m = 0;
                    l = 0;
                } else { m++; }
            }
        }
        m = 0;
        l++;
    }
    console.log("SAME PAIRINGS +" + samepairings);
    pairingarray.push(readyarray);
}

//MySQL conection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "amazon3210",
    database: "tct2018"
});


connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
});

connection.query("SELECT id from players where tournament_id = ?", [1], function (err, result) {
    result.map(player => playersarray.push(player.id));

    var pairings = [];
    var rounds = 15;
    var currentround = 1;
    var samepairings = 0;

    var copy = deepCopy(playersarray);
    pairings.push(copy.shuffle());
    console.log("Round 1 pairing complete");
    currentround++;

    while (currentround < rounds) {
        var copy = deepCopy(playersarray);
        pair(pairings, copy);
        currentround++;
    }

    for (var p = 0; p < pairings.length; p++){
        for (var s = 0; s < pairings[p].length; s+=2){
            connection.query("insert into tournament_pairings (tournament_id, player1, player2, round) VALUES (?,?,?,?)",[1,pairings[p][s],pairings[p][s+1],p+1]);
        }
    }
});