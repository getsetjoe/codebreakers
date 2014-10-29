var username = "";
var inputs = [];
var currIndex = 0;
var attempt = 1;
var opponentAttempt = 1;

//var socket = io('http://192.168.1.12');
var socket = io();

$(function() {
  FastClick.attach(document.body);
});

window.addEventListener("keypress", function (e) {
  if (e.which === 13 && !username) {
    username = $("#username").val();
    toggleOverlay(".overlay-start");
    socket.emit('start', username);
    return;
  }
  
  if (e.which === 13 && inputs.length === 4) {
    // Enter pressed
    makeGuess(inputs.join(""));
  } else if (username && inputs.length < 4) {
    var num = Number(String.fromCharCode(e.which));
    if (inputs.indexOf(num) == -1) {
      addNum(num, currIndex);
      $(".row:nth-child(" + attempt + ") > .cell:nth-child(" + (currIndex+1) + ")").text(num);
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

var prevNum;
$(".cell").not(".mine, .theirs")
  .data({
    nums: ["1","2","3","4","5","6","7","8","9","0"],
    index: 0
  })
  .on("click", function () {
    if ($(this).parent().hasClass("current") == false) return;
    
    var num = Number($(this).text());  
    if (!num) {
      num = 1
    } else if (num == 9) {
      num = 0;
    } else {
      num++;
    }
    currIndex = $(this).index();
    addNum(num, currIndex++);
    $(this).text(num);
  
    /*var data = $(this).data();
    if ($(this).hasClass("selected")) {
      data.index++;
      if (data.index == data.nums.length) data.index = 0;
      $(".cell").removeClass("selected");
    } else {
      if (prevNum) data.nums.splice(data.nums.indexOf(prevNum), 1);
    }
    var num = data.nums[data.index];
    $(this).text(num).addClass("selected");
    prevNum = num;
    $(this).data(data);*/
  });

$(".mine").on("click", function () {
  if ($(this).parent().hasClass("current") == false) return;
  makeGuess(inputs.join(""));
});

function addNum(num, index) {
  if ($.isNumeric(num) == false) return;  
  inputs[index] = num;
}

function deleteNum() {
  $(".row:nth-child(" + attempt + ") > .cell:nth-child(" + inputs.length + ")").text("");
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
  
socket.on('reply', function (res) {
  fillSlots(res, attempt, ".mine");
  
  if (attempt === 10) {
    socket.emit("lose", username);
    return;
  }
  
  attempt++;
  $(".row").removeClass("current");
  $(".row:nth-child(" + attempt + ")").addClass("current");
  clearInputs();
});

socket.on('opponent-guess', function (res) {
  fillSlots(res, opponentAttempt++, ".theirs");
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
