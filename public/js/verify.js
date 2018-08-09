$(document).ready(function(){
  // $(window).scroll(function(){
  //   $('#destination').css({'display':'none'});
  // });
  // $('a.verify').click(function(e){
  //   e.preventDefault();
  //   $('div.modal-header h4').text("Please type in your email to verify.");
  //   // Get the modal
  //   var modal = document.getElementById('myModal');

  //   // Get the button that opens the modal
  //   var btn = document.getElementById("myBtn");

  //   // Get the <span> element that closes the modal
  //   var span = document.getElementsByClassName("close")[0];

  //   // When the user clicks the button, open the modal
  //   modal.style.display = "block";

  //   // When the user clicks anywhere outside of the modal, close it
  //   window.onclick = function(event) {
  //     if (event.target == modal) {
  //       modal.style.display = "none";
  //       $('div.modal-body input').val("");
  //     }
  //   }
  // });

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
