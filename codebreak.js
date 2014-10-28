function codebreak()
{
  var numDigits = 4;
  var code = [];
  var nums = [0,1,2,3,4,5,6,7,8,9];
  var guesses = 0;
  
  function start() {
    generate();
  }
  
  function generate() {
    for (var i = 0; i < numDigits; i++) {
      code.push(nums.splice(Math.round(Math.random() * (nums.length - 1)), 1)[0].toString());
    }
  }
  
  function evaluate(guess) {
    var As = 0;
    var Bs = 0;
    var ans = guess.toString().split("");
    for (var i = 0; i < numDigits; i++) {
      if (ans[i] == code[i]) {
        As++;
        continue;
      }
      if (code.indexOf(ans[i]) > -1) {
        Bs++;
      }
    }    
    guesses++;
    return [As, Bs];
  }
  
  function numGuesses() {
    return guesses;
  }
  
  return {
    start: start,
    evaluate: evaluate,
    guesses: numGuesses,
    code: code
  }
}

module.exports = codebreak();