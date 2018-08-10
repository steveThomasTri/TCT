$("#playerregistrationform").on("submit", function(event){
  event.preventDefault();

  var playerdata = {
    firstname:$("#firstname").val().trim(),
    lastname:$("#lastname").val().trim(),
    dateofbirth:$("#birthmonth").val().trim()+"/"+$("#birthday").val().trim()+"/"+$("#birthyear").val().trim(),
    email:$("#email").val().trim(),
    username:$("#username").val().trim(),
    password:$("#password").val().trim(),
  }

  var playerdatapart2 = {
    address: $("#address1").val().trim()+" "+$("#address2").val().trim()+" "+$("#city").val().trim()+", "+$("#state").val().trim()+" "+$("#zip").val().trim(),
    phonenumber:$("#areacode").val().trim()+'-'+$("#phoneprefix").val().trim()+'-'+$("#phonesuffix").val().trim(),
    ssn:$("#SSNArea").val().trim()+'-'+$("#SSNGroup").val().trim()+'-'+$("#SSNSerial").val().trim()
  }

  $.ajax({
    url:"/api/playerregister",
    method:"POST",
    data:{playerdata:playerdata, playerdata2:playerdatapart2},
    success:function(data){

    }

  });
});
