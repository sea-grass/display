var App = function() {};
/* Define application defaults */
App.defaults = {
  n: 40,
  v: 11,
  style: "single",

  n_recommended_max: 4000
};
App.style_options = [
  ["Single", "single"],
  ["Multiple (overlay)", "overlay"],
  ["Multiple (individual)", "individual"]
];
App.notes = [
  "Only single style works at the moment.",
  "1 <= n <= 4000* -- *4000 is the recommended maximum",
  "1 <= v <= 255"
];
/* Define application elements */
var n_input, v_input, style_select, start_button, clear_button;

n_input = new Cel({
  type: "input",
  id: "n",
  attrs: {
    name: "n",
    type: "text",
    value: App.defaults.n
  }
});
v_input = new Cel({
  type: "input",
  id: "v",
  attrs: {
    name: "v",
    type: "text",
    value: App.defaults.v
  }
});
style_select = new Cel({
  type: "select",
  id: "style",
  attrs: {
    name: "style"
  },
  children: (function() {
    var options = [],
      option;
    for (var i = 0; i < App.style_options.length; i++) {
      option = {
        type: "option",
        attrs: {
          value: App.style_options[i][1]
        },
        innerHTML: App.style_options[i][0]
      };
      options.push(option);
    }
    return options;
  }())
});
start_button = {
  type: "button",
  innerHTML: "Start"
};
clear_button = {
  type: "button",
  innerHTML: "Clear",
  on: {
    click: function(e) {
      App.doClear.apply(e);
      return e.preventDefault();
    }
  }
};

App.cel = {
  classes: ["container"],
  children: [{
      classes: ["description"],
      children: [{
        type: "h6",
        innerText: "Web worker integration"
      }, 
      {
        type: "ul",
        classes: ["notes"],
        children: (function(){
          var notes = [];
          for (var i = 0; i < App.notes.length; i++) {
            notes.push({
              type: "li",
              innerText: App.notes[i]
            });
          }
          return notes;
        }())
      },
      {
        classes: ["workers"],
        innerText: "worker list"
      }]
    }, {
      type: "form",
      classes: ["render_form"],
      children: [{
          type: "label",
          innerHTML: "n",
          attrs: {
            for: "n"
          }
        },
        n_input, {
          type: "label",
          innerHTML: "v",
          attrs: {
            for: "v"
          }
        },
        v_input,
        style_select,
        start_button,
        clear_button
      ],
      on: {
        submit: function(e) {
          App.startRender.apply(e);
          return e.preventDefault();
        }
      }
    }

  ]
};
/* App methods */
App.init = function() {
  App.dom = new Cel(App.cel);
  document.body.appendChild(App.dom);
};
App.startRender = function() {
  var n, v, style;
  var doContinue = true;

  n = Number.parseInt(n_input.value);
  v = Number.parseInt(v_input.value);
  style = style_select.value;
  assert("N and V are integers", Number.isInteger(n), Number.isInteger(v));

  if (n > App.defaults.n_recommended_max) {
    doContinue = confirm("You entered an n greater than " + App.defaults.n_recommended_max + ". (n=" + n + "). This may take a long time. Proceed?");
    if (!doContinue) return;
  }

  App.dom.style.display = "none";

  App.draw(n, v, style);

  App.dom.style.display = "";
};
App.doClear = function() {
  console.log("yeeeo!");
  console.log("clea!");
  App.dom.remove();
  document.body.innerHTML="";
  document.body.appendChild(App.dom);
};
App.draw = function(n, v, style) {
  var myWorker;
  //spawn a new worker to generate the pixel data
  myWorker = new Worker("./worker.js");
  //Add to dom worker list
  document.querySelector(".workers").appendChild(new Cel({
    classes: ["worker", "n" + n + "v" + v],
    innerText: ["n:", n, "v:", v].join(" ")
  }));
  myWorker.onmessage = function(e) {
    var overlay, canvas, ctx, data;
    //remove worker from dom worker list
    document.querySelector([".worker.n", n, "v", v].join("")).remove();
    //display overlay message
    overlay = new Cel({
      classes: ["overlay"],
      children: [{
        classes: ["spinner"]
      }, {
        innerText: "Generating..."
      }, {
        innerText: ["n=", n, "v=", v].join("")
      }]
    });
    canvas = {
      type: "canvas",
      attrs: {
        width: n,
        height: n
      }
    };

    document.body.appendChild(overlay);

    ctx = new Cel(canvas).getContext("2d");
    setTimeout(function() {
        var img;
        App.drawPixelsToCanvas({
          ctx: ctx,
          style: style,
          pixels: e.data.imageData
        });

        img = new Cel({
          type: "img",
          classes: ["render"],
          attrs: {
            width: n * 2,
            height: n * 2,
            src: ctx.canvas.toDataURL()
          }
        });

        document.body.appendChild(img);
        overlay.remove();
        myWorker.terminate();
      },
      50);
  };
  myWorker.postMessage([n, v, style]);

};
App.drawPixelsToCanvas = function(settings) {
  var ctx, style, pixels, n;
  var id;

  ctx = settings.ctx;
  n = ctx.canvas.width;
  style = settings.style;
  pixels = settings.pixels;

  id = ctx.createImageData(n, n);
  for (var i = 0; i < n * n * 4; i++) {
    id.data[i] = pixels[i];
  }
  ctx.putImageData(id, 0, 0);
};

/* Lift off */
App.init();
