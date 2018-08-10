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
});
