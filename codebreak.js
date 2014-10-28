function codebreak()
{
  var numDigits = 4;
  var code = [];
  
  function start() {
    generate();
  }
  
  function generate() {
    var nums = [0,1,2,3,4,5,6,7,8,9];
    for (var i = 0; i < numDigits; i++) {
      code[i] = nums.splice(Math.round(Math.random() * (nums.length - 1)), 1)[0].toString();
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
    return [As, Bs];
  }
  
  return {
    start: start,
    evaluate: evaluate,
    generate: generate,
    code: code
  }
}

module.exports = codebreak();