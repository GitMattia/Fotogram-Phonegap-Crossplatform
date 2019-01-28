// Da fare: callLoadPost()
/************
 ** CLASSI **
 ************/
class GenericAdapter {
  constructor(div, array) {
    this._div = div;
    this._array = array;
  }
  refresh() {
    let newHTML = "<ul class='list-group'>";
    for (let el of this._array) {
      newHTML += "<li class='list-group-item' style='border: none; padding: 0px;'> " + this.generateListElement(el) + "</li>";
    }
    newHTML += "</ul>";
    this._div.html(newHTML);
  }
  generateListElement(element) {
    return element.toString();
  }
}

class Post {
  constructor(nameU, imgU, picture, msg) {
    this._nameU = nameU;
    this._imgU = imgU;
    this._picture = picture;
    this._msg = msg;
  }
  get nameU() {
    return this._nameU;
  }
  get imgU() {
    return this._imgU;
  }
  get picture() {
    return this._picture;
  }
  get msg() {
    return this._msg;
  }
  set nameU(newNameU) {
    this._nameU = newNameU;
  }
  set imgU(newImgU) {
    this._imgU = newImgU;
  }
  set picture(newPicture) {
    this._picture = newPicture;
  }
  set msg(newMsg) {
    this._msg = newMsg;
  }
}

class WallModel {
  constructor() {
    this._posts = [];
  }

  set post(newPost) {
    this._posts.push(newPost);
  }

  get post() {
    return this._posts;
  }
}

class ModelAdapter extends GenericAdapter {
  constructor(div, array) {
    super(div, array);
  }

  generateListElement(element) {
    let stringa = '<div class="container clickWall" data-personid = ' + element.nameU + '><div class="row mt-1 pb-1 justify-content-center"><div class="col-2 col-md-3"><img class="rounded-circle profileImg" src="data:image/jpg;base64,' + element.imgU + '" alt="Img Utente"></div><div class="col-6 col-md-6" id="user_name"><span class="align-middle">' + element.nameU + '</span></div></div><div class="row mb-1"><div class="col-12 col-md-7"><img class="img-fluid rounded mx-auto d-block" src="data:image/jpg;base64,' + element.picture + '" alt="Immagine Post"></div><div class="col-12 col-md-5 text-center" id="description" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + element.msg + '</div></div></div>';
    return stringa;
  }
}
/****************
 ** END CLASSI **
 ****************/
var wallM = new WallModel();
/**************
 ** FUNZIONI **
 **************/
/** Chiamata di rete Login **/
function callLogin(user, pw, divLogin, divHome) {
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/login",
    data: {
      username: user,
      password: pw
    },
    success: function(response) {
      console.log("Risposta: " + response);
      localStorage.setItem('session_id', response);
      localStorage.setItem('username', user);
      $(divLogin).hide();
      $(divHome).show();
      $(".view").hide();
      $(".viewHome").show();
      $("#bottom_bar").show();
      wallM.post.splice(0, wallM.post.length);
      callWall(response); //CHIAMATA DI RETE WALL
      let div = $("#contenitorePost");
      let genericAda = new ModelAdapter(div, wallM.post);
      genericAda.refresh();
      console.log(wallM.post);
      return true;
    },
    error: function(errorThrown) {
      if (errorThrown.status == 400) {
        console.log("Errore Login: DATI ERRATI");
        alert("Username o password errati");
      }
      else {
        console.log("Errore Login: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Chiamata di rete Wall **/
function callWall(id) {
  sessionId = id;
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/wall",
    data: {
      session_id: sessionId,
    },
    success: function(data) {
      listPost = JSON.parse(data);
      listPost = listPost.posts;
      for (let i of listPost) {
        wallM.post = new Post(i.user, null, i.img, i.msg);
      }
      callWallFollowed(sessionId); //CHIAMATA DI RETE FOLLOWED
    },
    error: function(errorThrown) {
      if (errorThrown.status == 401) {
        console.log("Errore Wall: DATI NON VALIDI");
        alert("Fare il logout e riaccedere");
      }
      else {
        console.log("Errore Wall: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Funzione che completa l'Adapter della Home **/
function callWallFollowed(id) {
  sessionId = id;
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/followed",
    data: {
      session_id: sessionId,
    },
    success: function(data) {
      listFollowed = JSON.parse(data);
      listFollowed = listFollowed.followed;
      for (let i of listFollowed) {
        for (let j of wallM.post) {
          if (i.name == j.nameU) {
            j.imgU = i.picture;
          }
        }
      }
      let div = $("#contenitorePost");
      let genericAda = new ModelAdapter(div, wallM.post);
      genericAda.refresh();
      console.log(wallM.post);
    },
    error: function(errorThrown) {
      if (errorThrown.status == 401) {
        console.log("Errore Wall Followed: DATI NON VALIDI");
        alert("Fare il logout e riaccedere");
      }
      else {
        console.log("Errore Wall Followed: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Chiamata di rete Ricerca Utenti **/
function callFindUser(id, letter) {
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/users",
    data: {
      session_id: id,
      usernamestart: letter,
      limit: 10
    },
    success: function(data) {
      list = JSON.parse(data);
      for (i = 0; i < list.users.length; i++) {
        $("#searchList").append("<ol class='clickSearch list-group-item' data-username = " + list.users[i].name + "><img class='img-fluid rounded-circle w-25 pr-2' src='data:image/jpg;base64," + list.users[i].picture + "' alt='Img Post'>" + list.users[i].name + "</ol>");
      }
    },
    error: function(errorThrown) {
      if (errorThrown.status == 401) {
        console.log("Errore Find User: DATI NON VALIDI");
        alert("Fare il logout e riaccedere");
      }
      else {
        console.log("Errore Find User: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

function searchClick() {
  const user = $(this).data('username');
  console.log("CLICK su: " + user);
  createGenericProfile(user);
}

/** Chiamata di rete Profilo **/
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
    error: function(errorThrown) {
      if (errorThrown.status == 401) {
        console.log("Errore Get Profile: SESSION ID NON VALIDO");
        alert("Fare il logout e riaccedere");
      }
      else if (errorThrown.status == 400) {
        console.log("Errore Get Profile: USERNAME NON VALIDO");
        alert("Provare a riavviare l'app");
      }
      else {
        console.log("Errore Get Profile: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Creazione profilo generico **/
function createGenericProfile(u) {
  id = localStorage.getItem('session_id');
  $(".view").hide();
  $(".viewGenericProfile").show();
  $("#generic_pr_username").text(u);
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/profile",
    data: {
      session_id: id,
      username: u
    },
    success: function(response) {
      callFollowed(id, u);
      let risp = JSON.parse(response);
      $("#generic_profile_picture").attr('src', 'data:image/jpg;base64,' + risp.img);
      let post = risp.posts;
      if (post.length < 1) {
        $("#msgNoPost_generic_profile").show();
      } else {
        $("#grid_post_generic_profile").empty();
        let img64;
        for (var i = 0; i < post.length; i++) {
          img64 = post[i].img;
          $("#grid_post_generic_profile").append('<img src="data:image/jpg;base64,' + img64 + '" alt="POST" class="img-fluid w-25 m-2 rounded">');
        }
      }
    },
    error: function(errorThrown) {
      if (errorThrown.status == 401) {
        console.log("Errore Generic Profile: SESSION ID NON VALIDO");
        alert("Fare il logout e riaccedere");
      }
      else if (errorThrown.status == 400) {
        console.log("Errore Generic Profile: USERNAME NON VALIDO");
        alert("Provare a riavviare l'app");
      }
      else {
        console.log("Errore Generic Profile: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Chiamata di rete Followed **/
function callFollowed(id, u) {
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/followed",
    data: {
      session_id: id
    },
    success: function(response) {
      let risp = JSON.parse(response);
      let seguiti = risp.followed;
      for (let i of seguiti) {
        if (u == i.name) {
          $("#btn_fol_unfol").text("Unfollow");
          return;
        } else {
          $("#btn_fol_unfol").text("Follow");
        }
      }
    },
    error: function(errorThrown) {
      if (errorThrown.status == 401) {
        console.log("Errore Call Followed: SESSION ID NON VALIDO");
        alert("Fare il logout e riaccedere");
      }
      else {
        console.log("Errore Call Followed: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Chiamata di rete Follow New User **/
function callFollowUser(id, user) {
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/follow",
    data: {
      session_id: id,
      username: user
    },
    success: function(response) {
      $('#btn_fol_unfol').text('Unfollow');
    },
    error: function(errorThrown) {
      console.log(errorThrown);
      if (errorThrown.status == 401) {
        console.log("Errore Follow User: SESSION ID NON VALIDO");
        alert("Fare il logout e riaccedere");
      }
      else if (errorThrown.status == 400 && errorThrown.responseText == "ALREADY FOLLOWING USER") {
        console.log("Errore Follow User: SEGUO GIA L'UTENTE");
        alert("Segui già questo utente. Prova a riavviare l'app");
      }
      else if (errorThrown.status == 400 && errorThrown.responseText == "CANNOT FOLLOW YOURSELF") {
        console.log("Errore Follow User: NON PUOI SEGUIRTI");
        alert("Non puoi auto seguirti. Prova a riavviare l'app");
      }
      else if (errorThrown.status == 400 && errorThrown.responseText == "USERNAME NOT FOUND") {
        console.log("Errore Follow User: USERNAME NON TROVATO");
        alert("Prova a riavviare l'app");
      }
      else {
        console.log("Errore Follow User: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Chiamata di rete Unfollow User **/
function callUnfollowUser(id, user) {
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/unfollow",
    data: {
      session_id: id,
      username: user
    },
    success: function(response) {
      $('#btn_fol_unfol').text('Follow');
    },
    error: function(errorThrown) {
      console.log(errorThrown);
      if (errorThrown.status == 401) {
        console.log("Errore Unfollow User: SESSION ID NON VALIDO");
        alert("Fare il logout e riaccedere");
      }
      else if (errorThrown.status == 400 && errorThrown.responseText == "YOU ARE NOT FOLLOWING THAT USER") {
        console.log("Errore Unfollow User: NON SEGUI QUESTO UTENTE");
        alert("Non segui questo utente. Prova a riavviare l'app");
      }
      else if (errorThrown.status == 400 && errorThrown.responseText == "USERNAME NOT FOUND") {
        console.log("Errore Unfollow User: USERNAME NON TROVATO");
        alert("Prova a riavviare l'app");
      }
      else {
        console.log("Errore Unfollow User: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Chiamata di rete Logout **/
function callLogout(id) {
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/logout",
    data: {
      session_id: id
    },
    success: function(response) {
      localStorage.setItem('session_id', 0);
      $(".view").hide();
      $("#bottom_bar").hide();
      $("#div_login").show();
    },
    error: function() {
      localStorage.setItem('session_id', 0);
      $(".view").hide();
      $("#bottom_bar").hide();
      $("#div_login").show();
    }
  });
}
/****** End *****/

/** Funzioni immagine nuovo posto **/
function onSuccessPost(imageData) {
  var image = document.getElementById('imgLoadPost');
  image.src = "data:image/jpeg;base64," + imageData;
}

function onFailPost(message) {
  alert('Failed because: ' + message);
}

function callLoadPost(img, msg) {
  let id = localStorage.getItem('session_id');
  let imgsub = img.substring(23);
  console.log(imgsub);
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/create_post",
    data: {
      session_id: id,
      img: imgsub,
      message: msg
    },
    success: function(response) {
      console.log("Post aggiunto");
      $(".view").hide();
      $(".viewHome").show();
      $("#contenitorePost").empty();
      var sessionId = localStorage.getItem('session_id');
      wallM.post.splice(0, wallM.post.length);
      callWall(sessionId); //CHIAMATA DI RETE WALL
    },
    error: function(errorThrown) {
      if (errorThrown.status == 401) {
        console.log("Errore Load Post: SESSION ID NON VALIDO");
        alert("Fare il logout e riaccedere");
      }
      else {
        console.log("Errore Load Post: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}
/****** End *****/

/** Funzioni immagine nuova profilo **/
function onSuccessProfile(imageData) {
  let id = localStorage.getItem('session_id');
  $.ajax({
    method: "post",
    url: "https://ewserver.di.unimi.it/mobicomp/fotogram/picture_update",
    data: {
      session_id: id,
      picture: imageData
    },
    success: function(response) {
      console.log("Immagine del profilo aggiornata");
      var image = document.getElementById('profile_picture');
      image.src = "data:image/jpeg;base64," + imageData;
    },
    error: function(errorThrown) {
      if (errorThrown.status == 401) {
        console.log("Errore Change Img Profile: SESSION ID NON VALIDO");
        alert("Fare il logout e riaccedere");
      }
      else {
        console.log("Errore Change Img Profile: RETE");
        alert("Problemi di connessione");
      }
    }
  });
}

function onFailProfile(message) {
  alert('Failed because: ' + message);
}
/****** End *****/

/******************
 ** END FUNZIONI **
 ******************/

/*******************
 ** DOCUMENT READY **
 ********************/
$(document).ready(function() {

  /** Verifica login **/
  var sessionId = localStorage.getItem('session_id');
  if (sessionId == 0 || sessionId == null) {
    $("#div_login").show();
    $("#div_afterLogin").hide();
    $("#bottom_bar").hide();
    $("#btn_login").click(function() {
      let user = $("#input_username").val();
      let pw = $("#input_password").val();
      if (user.length == 0 || pw.length == 0) {
        alert("Inserire i campi");
      } else {
        callLogin(user, pw, "#div_login", "#div_afterLogin"); //CHIAMATA DI RETE LOGIN
      }
    });
  } else {
    $("#div_login").hide();
    $("#div_afterLogin").show();
    $("#bottom_bar").show();
    wallM.post.splice(0, wallM.post.length);
    var sessionId = localStorage.getItem('session_id');
    callWall(sessionId); //CHIAMATA DI RETE WALL
  }
  /****** End *****/

  /** Home Tab **/
  $("#goToHome").click(function() {
    $(".view").hide();
    $(".viewHome").show();
    $("#contenitorePost").empty();
    wallM.post.splice(0, wallM.post.length);
    var sessionId = localStorage.getItem('session_id');
    callWall(sessionId); //CHIAMATA DI RETE WALL
  });
  $(document).on("click", ".clickWall", function() {
    let user = $(this).data("personid");
    createGenericProfile(user);
  });
  /****** End *****/

  /** Search Tab **/
  $("#goToSearch").click(function() {
    $(".view").hide();
    $(".viewSearch").show();
    $("#searchList").empty();
  });
  $("#searchInput").keyup(function() {
    let list;
    let letter = $(this).val();
    $("#searchList").empty();
    if (letter == "") {
      $("#searchList").empty();
    } else {
      id = localStorage.getItem('session_id')
      callFindUser(id, letter); //CHIAMATA DI RETE RICERCA UTENTI
    }
  });
  $(document).on('click', '#searchList .list-group-item', searchClick);
  /****** End *****/

  /** New Post Tab **/
  $("#goToNew").click(function() {
    $(".view").hide();
    $(".viewNew").show();
  });
  $('#imgAddPost').click(function() {
    navigator.camera.getPicture(onSuccessPost, onFailPost, { //Plugin per aprire galleria
      quality: 25,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    });
  });
  $('#publicAddPost').click(function() {
    if ($("#msgAddPost").val() == "") {
      alert("Devi scrivere");
    } else if ($("#imgLoadPost").attr("src") == "") {
      alert("Devi selezionare una foto");
    } else {
      var img = $("#imgLoadPost").attr("src");
      var postText = $("#msgAddPost").val();
      callLoadPost(img, postText); //CHIAMTA DI RETE PER CARICARE POST
    }
  });
  /****** End *****/

  /** Profile Tab **/
  $("#goToProfile").click(function() {
    $(".view").hide();
    $(".viewProfile").show();
    var sessionId = localStorage.getItem('session_id');
    let user = localStorage.getItem('username')
    $("#pr_username").text(user);
    callGetProfile(sessionId, user); //CHIAMATA DI RETE PROFILO
  });
  $('#btn_change_img').click(function() {
    navigator.camera.getPicture(onSuccessProfile, onFailProfile, { //Plugin per aprire galleria
      quality: 25,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    });
  });
  $("#btn_logout").click(function() {
    sessionId = localStorage.getItem('session_id');
    callLogout(sessionId); //CHIAMATA DI RETE LOGOUT
  });
  /****** End *****/

  /** Generic Profile Tab **/
  $('#btn_fol_unfol').click(function() {
    let user = localStorage.getItem('username');
    let id = localStorage.getItem('session_id')
    if (user == $('#generic_pr_username').text()) {
      alert("Non puoi smettere di seguirti");
    } else if ($('#btn_fol_unfol').text() == 'Follow') {
      callFollowUser(id, $('#generic_pr_username').text());
    } else if ($('#btn_fol_unfol').text() == 'Unfollow') {
      callUnfollowUser(id, $('#generic_pr_username').text());
    }
  });
  /****** End *****/

});
/***********************
 ** END DOCUMENT READY **
 ************************/
