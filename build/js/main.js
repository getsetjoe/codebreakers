var username = "";
var inputs = [];
var currIndex = 0;
var attempt = 1;

var socket = io();

$(function() {
  FastClick.attach(document.body);
});

window.addEventListener("keypress", function (e) {
  if (e.which === 13 && !username) {
    username = String($("#username").val()).replace(/[^a-zA-Z0-9]/, "");
    toggleOverlay(".overlay-start");
    socket.emit('start', username);
    return;
  }
  
  if (e.which === 13 && inputs.length === 4) {
    // Enter pressed
    makeGuess(inputs.join(""));
  } else if (username && inputs.length < 4) {
    var num = Number(String.fromCharCode(e.which));
    if (inputs.indexOf(num) == -1 && isNaN(num) == false) {
      addNum(num, currIndex);
      $(".row:nth-child(" + (attempt+1) + ") > .cell:nth-child(" + (currIndex+1) + ")").text(num);
      currIndex++;
    }
  }
});

window.addEventListener("keydown", function (e) {
  if (e.which === 8) {
    if (!username) return;
    // Backspace pressed
    e.preventDefault();
    deleteNum();
    currIndex--;
  }
});

$(".cell").not(".mine, .theirs")
  .data({
    nums: ["1","2","3","4","5","6","7","8","9","0"],
    index: 0
  })
  .on("click", function () {
    if ($(this).parent().hasClass("current") == false) return;
    
    var num = Number($(this).text());  
    if (!num) {
      num = nextAvailNum(0);
    } else {
      num = nextAvailNum(num);
    }
    currIndex = $(this).index();
    addNum(num, currIndex++);
    $(this).text(num);
  });

function nextAvailNum(num) {
  num++;
  if (num === 10) num = 0;
  if (inputs.indexOf(num) != -1) {
    return nextAvailNum(num);
  }
  return num;
}

$(".mine").on("click", function () {
  if ($(this).parent().hasClass("current") == false) return;
  if (inputs.length != 4) return;
  makeGuess(inputs.join(""));
});

function addNum(num, index) {
  if ($.isNumeric(num) == false) return;  
  inputs[index] = num;
}

function deleteNum() {
  $(".row:nth-child(" + (attempt+1) + ") > .cell:nth-child(" + inputs.length + ")").text("");
  inputs.pop();
}

function makeGuess(guess) {
  socket.emit('guess', guess);
  currIndex = 0;
}

function clearInputs() {
  inputs = [];
}

function fillSlots(res, index, container) {
  var counter = 0;

  for (var i = 0; i < res[0]; i++) {
    counter++;
    $(".row:nth-child(" + index + ") > " + container + " > .slot:nth-child(" + counter + ")").css("background", "#333");
  }

  for (i = 0; i < res[1]; i++) {
    counter++;
    $(".row:nth-child(" + index + ") > " + container + " > .slot:nth-child(" + counter + ")").css("background", "#FFF");
  }
}

function addTheirSlots(name) {
  $(".row").append('<div class="cell theirs ' + name.toLowerCase() + '"><div class="slot"></div><div class="slot"></div><div class="slot"></div><div class="slot"></div></div>');
  $(".headings").append('<div class="cell theirs ' + name.toLowerCase() + '"><span class="name">' + name.substr(0, 1) + '</span></div>');
}

socket.on('reply', function (res) {
  fillSlots(res, attempt+1, ".mine");
  
  if (res.join() != "4,0" && attempt === 10) {
    socket.emit("lose", username);
    return;
  }
  
  attempt++;
  $(".row").removeClass("current");
  $(".row:nth-child(" + (attempt+1) + ")").addClass("current");
  clearInputs();
});

socket.on('join', function (name) {
  addTheirSlots(name);
});

socket.on('opponent-guess', function (res, name, attempts) {
  if ($("." + name.toLowerCase()).length === 0) {
    addTheirSlots(name);
  }
  fillSlots(res, attempts+1, "." + name.toLowerCase());
});

socket.on('win', function (data) {
  var code, guesses;
  if (username == data.name) {
    code = $(".overlay-win .code");
    guesses = code.next();
    code.text(code.text().replace(/{{code}}/, data.code));
    guesses.text(guesses.text().replace(/{{guesses}}/, attempt - 1));
    toggleOverlay(".overlay-win");
  } else {
    $(".overlay-lose h2").text(data.name + " wins!");
    code = $(".overlay-lose .code");
    code.text(code.text().replace(/{{code}}/, data.code));
    toggleOverlay(".overlay-lose");
  }
});

socket.on('lose', function (data) {
  var code, guesses;
  if (username == data.name) {
    code = $(".overlay-lose .code");
    code.text(code.text().replace(/{{code}}/, data.code));
    toggleOverlay(".overlay-lose");
  } else {
    code = $(".overlay-win .code");
    guesses = code.next();
    code.text(code.text().replace(/{{code}}/, data.code));
    toggleOverlay(".overlay-win");
  }
});

socket.on('disconnect', function (data) {
  toggleOverlay(".overlay-disconnect");
});