function assert() {
  if (arguments.length < 2) throw "Assert didn't receive enough args.";

  var message = arguments[0];
  var failed = false;
  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i]) {
      failed = true;
      break;
    }
  }
  if (failed) {
    throw "Assert failed: " + message;
  }
}

function to1d(x, y, n) {
  return y * n + x;
}

var q = document.querySelector.bind(document),
  create = document.createElement.bind(document);
