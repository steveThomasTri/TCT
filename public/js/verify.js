$(document).ready(function(){

  $('button.verify').click(function(){
    //2 email is not in bouncer lsit
    var email = $('div.modal-body input#email').val();
    var pwd = $('div.modal-body input#pwd').val();

    if(email == ''){
      $('#exampleModalCenterTitle').text("We did not find that email.");
    } else {
      $.ajax({
        url:"/api/verify",
        method:'POST',
        data:{'email':email, 'password':pwd},
        success:function(data){
          if (data == "YES"){
            var d = new Date();
            var n = d.getTime();
            sessionStorage.setItem("stc",n);
            window.location.href = "/tournamentinfo";
          }else if (data == "NO"){
            $('#exampleModalCenterTitle').text("We did not find that email. Try again!");
          }
        }
      });
    }
  });

  $("button.playerverify").click(function(){
    var playerusername = $('div.modal-body input#playerusername').val();
    var playerpassword = $('div.modal-body input#playerpwd').val();

    if (playerusername == "" || playerpassword == ""){
      $('#playerhqtitle').text("You must enter a username and password.");
    } else {
      //alert(playerusername + playerpassword);
      $.ajax({
        url:"/api/verify_player",
        method:"POST",
        data:{'username':playerusername, 'password':playerpassword},
        success:function(data){
          if (data == "YES"){
            window.location.href = "/playerHQ";
          }else if (data == "NO"){
          }
        }
      })
    }
  })
});
