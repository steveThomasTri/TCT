if (sessionStorage.getItem("stc") == null){
  window.location.href = "/";
}

var eventList = [];

function validator(input, regexator){
    if (input.val().trim() != '' && regexator.test(input.val().trim())){
        input.removeClass("is-invalid");
        input.addClass("is-valid");
        input.next().addClass("hidden");
    } else {
        input.removeClass("is-valid");
        input.addClass("is-invalid");
        input.next().removeClass("hidden");
    }
}

$("#tournamentname").on("change", function(){
    validator($(this), /.+/);
});

$("#tournamentdate").on("change", function(){
    validator($(this), /(0\d|1[012])[\/]([012]\d|3[01])[\/](201[89])/);
});

$("#tournamentmaxnum").on("change", function(){
    validator($(this), /^[0-9]{2,4}$/);
});

$("#tournamentloc").on("change", function(){
    validator($(this), /.+/);
});

$("#tournamentvalidmail").on("change", function(){
    validator($(this), /.+/);
});

$("#tournamentcode").on("change", function(){
    validator($(this), /^[a-z]{4}$/);
});

$("#tournamentevents").on("keydown", function(){
    var eventlist = $(this).val().split("\n");
    eventList = [];
    var numberEvents = 0;
    for (i=0; i<eventlist.length; i++){
        if (eventlist[i] != ""){
            numberEvents++;
            eventList.push(eventlist[i]);
        }
    }
    $("span#eventCounter").text(numberEvents);
});

$("#tournamentevents").on("blur", function(){
    var eventlist = $(this).val().split("\n");
    var numberEvents = 0;
    for (i=0; i<eventlist.length; i++){
        if (eventlist[i] != "") numberEvents++;
    }
    $("span#eventCounter").text(numberEvents);

    if (numberEvents > 9){
        $(this).removeClass("is-invalid");
        $(this).addClass("is-valid");
    } else {
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid");
    }
});

$("#tournamentregistrationform").on("submit", function(event){
    event.preventDefault();
    //event.stopPropogation();
    if ($(".is-valid").length == 7){
        var tournamentData = {
            name: $("#tournamentname").val(),
            date: $("#tournamentdate").val(),
            maxnum: parseInt($("#tournamentmaxnum").val()),
            location: $("#tournamentloc").val(),
            code: $("#tournamentcode").val(),
            email: $("#tournamentvalidmail").val(),
            events: eventList,
        }

        $("#loader").removeClass("hidden");

        $.ajax({
            url:"/api/tournamentdata",
            method:"POST",
            data:tournamentData,
            success:function(coode){
                console.log(coode);
                sessionStorage.setItem("code", coode.code);
                window.location.href = "/setactivities/" + coode.code;
            }
        });
    }

});
