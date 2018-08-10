$("#playerregistrationform").on("submit", function(event){
  event.preventDefault();

  //17 items need to be verified
  var playerdata = {
    firstname:$("#firstname").val().trim(),
    lastname:$("#lastname").val().trim(),
    dateofbirth:$("#birthmonth").val().trim()+"/"+$("#birthday").val().trim()+"/"+$("#birthyear").val().trim(),
    email:$("#email").val().trim(),
    username:$("#username").val().trim(),
    password:$("#password").val().trim(),
    code:window.location.href.split("/")[4],
    infosens:""
  }

  var playerdatapart2 = {
    address: $("#address1").val().trim()+" "+$("#address2").val().trim()+" "+$("#city").val().trim()+", "+$("#state").val().trim()+" "+$("#zip").val().trim(),
    phonenumber:$("#areacode").val().trim()+'-'+$("#phoneprefix").val().trim()+'-'+$("#phonesuffix").val().trim(),
    ssn:$("#SSNArea").val().trim()+'-'+$("#SSNGroup").val().trim()+'-'+$("#SSNSerial").val().trim()
  }

  console.log(playerdata);
  $.ajax({
    url:"/api/playerregister",
    method:"POST",
    data:{playerdata:playerdata, playerdata2:playerdatapart2},
    success:function(data){
      if (data){
        window.location.href = "/congratulations";

      } else {
        console.log("data is not in, error");
      }
    }

  });
});
