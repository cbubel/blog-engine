var posts = {};
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var current_post = undefined;

var message = function(type, text) {
  var message = document.createElement("div");
  message.className = type + " message";
  message.innerHTML = text;
  var container = document.querySelector("#page-wrapper");
  container.insertBefore(message, document.querySelector("#post-form"));
  setTimeout(function() {
    container.removeChild(message);
  }, 1500);
}

var loadComments = function(post_id) {
  var container = document.querySelector("#comments");
  container.innerHTML = "";

  var comments = posts[post_id].comments;

  if(!comments) {
    return;
  }
  else {
    var header = document.createElement("h2");
    header.innerHTML = "Comments";
    container.appendChild(header);
  }

  for(var key in comments) {
    if(comments.hasOwnProperty(key)) {
      var comment_container = document.createElement("div");
      comment_container.className = "comment";
      var name = document.createElement("h3");
      var time = document.createElement("small");
      var comment_text = document.createElement("p");

      name.innerHTML = comments[key].name + " says: ";
      time.innerHTML = buildTime(comments[key].timestamp);
      comment_text.innerHTML = comments[key].comment;
      comment_container.appendChild(name);
      comment_container.appendChild(time);
      comment_container.appendChild(comment_text);
      container.appendChild(comment_container);
    }
  }
}

var newComment = function(e) {
  e.preventDefault();

  var name = document.querySelector("#input-name").value;
  var comment = document.querySelector("#input-comment").value;
  var post_id = location.hash.slice(1, location.hash.length)
  var payload = {name: name, comment: comment, post_id: post_id};

  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if(this.status === 200) {
      var return_comments = JSON.parse(this.response);
      posts[post_id].comments = return_comments;
      loadComments(post_id);
      document.querySelector("#comment-form").reset();
      message("success", "Comment successfully added!");
    } else {
      message("error", "Oh no! Server error!")
    }
  };
  xhr.open("POST", "/comment", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(payload));
}

var newPost = function(e) {
  e.preventDefault();

  var title = document.querySelector("#input-title").value;
  var contents = document.querySelector("#input-contents").value;
  var payload = {title: title, contents: contents};

  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if(this.status === 200) {
      document.querySelector("#post-form").reset();
      message("success", "Post successfully added!");
      setTimeout(function() {
        window.location.assign("/");
      }, 1000);
    } else {
      message("error", "Oh no! Server error!")
    }
  };
  xhr.open("POST", "/post", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(payload));
}

var getPosts = function(callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if(this.status == 200) {
      var res = JSON.parse(this.response);
      for(key in res) {
        if(res.hasOwnProperty(key)) {
          posts[key] = res[key];
          buildShortPost(key, res[key]);
          // buildLongPost(key, res[key]);

          initial_state = document.body;
        }
      }
      callback();
    } else {
      message("error", "Oh no! Server error!")
    }
  };
  xhr.open("GET", "/posts", true);
  xhr.send();
}

var buildTime = function(timestamp) {
  var pm = false;
  var result = "";
  var sec = timestamp / 1000;
  var time = new Date(0);
  time.setUTCSeconds(sec);
  var month = months[time.getMonth()];
  var day = time.getDay();
  var year = time.getFullYear();
  var hours = time.getHours();
  if(hours > 12) {
    hours -= 12
    pm = true;
  };
  var minutes = time.getMinutes();

  if(minutes < 10) {
    minutes = "" + 0 + minutes;
  }

  var postfix = "";

  if(pm) {
    postfix = "pm";
  }
  else {
    postfix = "am"
  }

  result = "Created on " + month + " " + day + ", " + year + " at " + hours + ":" + minutes + postfix;

  return result;
}

var buildShortPost = function(key, post) {
  var div = document.createElement("div");
  var header = document.createElement("h2");
  var link = document.createElement("a");
  var time = document.createElement("small");
  var body = document.createElement("p");

  link.innerHTML = post.title;
  link.href = "#" + key;
  header.appendChild(link);
  if(post.contents.length > 200) {
    body.innerHTML = post.contents.substring(0, 199) + "...";
  }
  else {
    body.innerHTML = post.contents;
  }
  time.innerHTML = buildTime(post.timestamp);

  div.className = "short-post";
  div.appendChild(header);
  div.appendChild(time);
  div.appendChild(body);
  var container = document.querySelector("#post-list");
  container.insertBefore(div, container.firstChild);
}

var buildLongPost = function(key) {
  var div = document.createElement("div");
  var header = document.createElement("h2");
  var time = document.createElement("small");
  var post = posts[key];

  header.innerHTML = post.title;
  time.innerHTML = buildTime(post.timestamp);

  div.className = "long-post";
  div.id = key;
  div.style.display = "none";
  div.appendChild(header);
  div.appendChild(time);

  var paragraphs = post.contents.split("\n\n");
  paragraphs.forEach(function(paragraph) {
    var p = document.createElement("p");
    p.innerHTML = paragraph;
    div.appendChild(p);
  })

  document.querySelector("#full-posts").appendChild(div);
}

var hideDivs = function(arrIds) {
  arrIds.forEach(function(id) {
    document.querySelector(id).style.display = "none";
  });
}

var showDivs = function(arrObs) {
  arrObs.forEach(function(contents) {
    document.querySelector(contents.id).style.display = contents.show_type;
  });
}

var destroyPostView = function() {
  document.querySelector("#full-posts").removeChild(document.querySelector(current_post));
  current_post = undefined;
}

var handleHash = function() {
  if(location.hash === "") {
    showDivs([{id: "#post-list", show_type: "flex"}, {id: "#new-post", show_type: "inline-block"}]);
    hideDivs(["#post-form", "#comment-form", "#comments"]);
    if(current_post !== undefined) {
      destroyPostView();
    }
  }
  else if(location.hash === "#new-post") {
    showDivs([{id: "#post-form", show_type: "inline-block"}]);
    hideDivs(["#new-post", "#post-list", "#comment-form", "#comments"]);
    if(current_post !== undefined) {
      destroyPostView();
    }
  }
  else { // Selected post
    if(current_post !== undefined) {
      destroyPostView();
    }
    current_post = location.hash;
    var post_id = current_post.slice(1, current_post.length)
    buildLongPost(post_id);
    showDivs([
      {id: current_post, show_type: "inline-block"},
      {id: "#comment-form", show_type: "inline-block"},
      {id: "#comments", show_type: "inline-block"},
      {id: "#new-post", show_type: "inline-block"}
    ]);
    hideDivs(["#post-list", "#post-form"]);
    loadComments(post_id);
    document.querySelector("#page-wrapper").scrollTop = 0
  }
}

var init = function() {
  document.querySelector("#post-form").style.display = "none";
  document.querySelector("#submit").addEventListener("click", newPost);
  document.querySelector("#submit-comment").addEventListener("click", newComment);
  window.addEventListener("hashchange", handleHash);
  window.addEventListener("load", function() {
    getPosts(function() {
      handleHash();
    });
  });
}

init();
