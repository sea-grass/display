var App = function() {};

/* Define application defaults */
App.defaults = {
  n: 40,
  v: 11,
  style: "single",
  n_recommended_max: 4000
};

var n_input = q("#n"),
    v_input = q("#v");

n_input.value = App.defaults.n;
v_input.value = App.defaults.v;
q("#app .interface").addEventListener("submit", e => {
  e.preventDefault();
  App.render();
  return false;
});

App.render = function() {
  var n, v, style;
  var doContinue = true;

  n = Number.parseInt(n_input.value);
  v = Number.parseInt(v_input.value);
  assert("N and V are integers", Number.isInteger(n), Number.isInteger(v));

  if (n > App.defaults.n_recommended_max) {
    doContinue = confirm("You entered an n greater than " + App.defaults.n_recommended_max + ". (n=" + n + "). This may take a long time. Proceed?");
    if (!doContinue) return;
  }

  App.draw(n, v);
};

App.log = function(message) {
  var logMessage = create("li");
  // easy way to include the time of the message
  logMessage.innerText = new Date() + " " + message;
  q("#app .log ul").appendChild(logMessage);
  // cheap hack to keep it scrolled at the bottom
  q("#app .log").scrollTop = 9999;
};

App.draw = function(n, v) {
  var myWorker;
  //spawn a new worker to generate the pixel data
  myWorker = new Worker("./worker.js");


  myWorker.onmessage = function(e) {
    var overlay = create("div");
    overlay.classList.add("overlay");
    overlay.innerText = "Working on n: " + n + " - v: " + v;
    document.body.appendChild(overlay);

    var canvas = create("canvas");
    canvas.setAttribute("width", n);
    canvas.setAttribute("height", n);

    var ctx = canvas.getContext("2d");

    App.drawPixelsToCanvas({
      ctx: ctx,
      pixels: e.data.imageData
    });

    var img = create("img");
    img.setAttribute("src", canvas.toDataURL());
    img.setAttribute("width", n * 2);
    img.setAttribute("width", n * 2);
    img.setAttribute("title", "n: " + n + " - v: " + v);

    document.body.appendChild(img);

    overlay.remove();

    myWorker.terminate();
    App.log("Worker terminated");
  };

  // Kick off the worker
  myWorker.postMessage([n, v]);
  App.log("Worker spawned");
};

App.drawPixelsToCanvas = function(settings) {
  var ctx, pixels, n;
  var id;

  ctx = settings.ctx;
  n = ctx.canvas.width;
  pixels = settings.pixels;

  id = ctx.createImageData(n, n);
  for (var i = 0; i < n * n * 4; i++) {
    id.data[i] = pixels[i];
  }
  ctx.putImageData(id, 0, 0);
};
