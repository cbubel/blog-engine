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

var newPost = function(e) {
  e.preventDefault();

  var title = document.querySelector("#input-title").value;
  var contents = document.querySelector("#input-contents").value;
  var payload = {title: title, contents: contents};
  console.log(contents);

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
          buildLongPost(key, res[key]);

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

var buildLongPost = function(key, post) {
  var div = document.createElement("div");
  var header = document.createElement("h2");
  var time = document.createElement("small");

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

var handleHash = function() {
  if(location.hash === "") {
    document.querySelector("#post-list").style.display = "flex";
    document.querySelector("#post-form").style.display = "none";
    document.querySelector("#new-post").style.display = "inline-block";
    if(current_post !== undefined) {
      document.querySelector(current_post).style.display = "none";
      current_post = undefined;
    }
  }
  else if(location.hash === "#new-post") {
    document.querySelector("#post-form").style.display = "inline-block";
    document.querySelector("#new-post").style.display = "none";
    document.querySelector("#post-list").style.display = "none";
    if(current_post !== undefined) {
      document.querySelector(current_post).style.display = "none";
      current_post = undefined;
    }
  }
  else {
    if(current_post !== undefined) {
      document.querySelector(current_post).style.display = "none";
    }
    current_post = location.hash;
    document.querySelector(current_post).style.display = "inline-block";
    document.querySelector("#new-post").style.display = "inline-block";
    document.querySelector("#post-list").style.display = "none";
    document.querySelector("#post-form").style.display = "none";
  }
}

var init = function() {
  document.querySelector("#post-form").style.display = "none";
  document.querySelector("#submit").addEventListener("click", newPost);
  window.addEventListener("hashchange", handleHash);
  window.addEventListener("load", function() {
    getPosts(function() {
      handleHash();
    });
  });
}

init();
