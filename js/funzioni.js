

function callLogout(id, divLogin, divHome) {
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/logout",
    data: {
      session_id: id
    },
    success: function(response) {
      localStorage.setItem('session_id', 0);
      $(divLogin).show();
      $(divHome).hide();
    },
    error: function() {
      console.log("Errore Logout");
    }
  });
}

function callGetProfile(id, username) {
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/profile",
    data: {
      session_id: id,
      username: username
    },
    success: function(response) {
      let risp = JSON.parse(response);
      $("#profile_picture").attr('src', 'data:image/jpg;base64,' + risp.img);
      let post = risp.posts;
      if (post.length < 1) {
        $("#msgNoPost_profile").show();
      } else {
        $("#grid_post_profile").empty();
        let img64;
        for (var i = 0; i < post.length; i++) {
          img64 = post[i].img;
          $("#grid_post_profile").append('<img src="data:image/jpg;base64,' + img64 + '" alt="POST" class="img-fluid w-25 m-2 rounded">');
        }
      }
    },
    error: function() {
      console.log("Errore Profile");
    }
  });
}
