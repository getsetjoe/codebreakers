var codebreak = require("./codebreak");

/*var prompt = require('prompt');
codebreak.start();
console.log("\nWelcome to Code Breakers!");
console.log("=========================\n");
//console.log(codebreak.code);
ask();

function ask() {
  prompt.start();
  prompt.get(['guess'], function (err, result) {
    if (result.guess == "ans") {
      console.log(codebreak.code);
      return;
    }
    var res = codebreak.evaluate(result.guess);
    if (res.join() == "4,0") {
      console.log("CORRECT! You did it in " + codebreak.guesses() + " guesses.");
    } else {
      console.log(res);
      ask();
    }
  });
}*/


var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(server, {'heartbeat timeout': 60});
var path = require('path');

codebreak.start();
console.log("=== Welcome to Code Breakers ===");
console.log(codebreak.code);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res){
  res.sendFile('index.html');
});

io.on('connection', function (socket) {
  console.log('Client ' + socket.id + ' connected');
  
  socket.on('start', function(val){
    socket.username = val.replace(/[^a-zA-Z0-9]/, "");
    socket.attempts = 0;
    socket.broadcast.emit('join', socket.username);
    console.log(socket.username + " has joined the game");
  });
  
  socket.on('guess', function(val){
    var res = codebreak.evaluate(val);
    socket.emit('reply', res);
    socket.attempts++;
    socket.broadcast.emit('opponent-guess', res, socket.username, socket.attempts);
    console.log(socket.username + " guessed " + val);
    
    if (res.join() == "4,0") {
      io.emit('win', {
        name: socket.username,
        code: codebreak.code.join(""),
        attempts: socket.attempts
      });
      console.log(socket.username + " wins!");
      console.log("=== new game ===");
      codebreak.generate();
      console.log(codebreak.code);
    }
  });
  
  socket.on('lose', function(loser) {
    socket.emit('lose', {
      name: loser,
      code: codebreak.code.join("")
    });
    console.log(socket.username + " loses.");
  });
  
  socket.on('disconnect', function () {
    console.log('Client ' + socket.id + ' disconnected');
  });
  
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});