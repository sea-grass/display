(function() {
  'use strict';
  var container, n_input, v_input, image_input, overlay_checkbox, style_select, start_button, start_image_button,clear_button;

  n_input = new Cel({
    type: "input",
    id: "n",
    attrs: {
      name: "n",
      type: "text",
      value: 40
    }
  });
  v_input = new Cel({
    type: "input",
    id: "v",
    attrs: {
      name: "v",
      type: "text",
      value: 11
    }
  });
  image_input = new Cel({
    type: "input",
    id: "image",
    attrs: {
      name: "image",
      type: "file",
      value: null
    }
  });
  overlay_checkbox = new Cel({
    type: "input",
    id: "overlay",
    attrs: {
      name: "overlay",
      type: "checkbox"
    }
  });
  style_select = new Cel({
    type: "select",
    id: "style",
    attrs: {
      name: "style",
      type: "select"
    },
    children: [
      {
        type: "option",
        attrs: {
          value: "-1"
        },
        innerHTML: "Select a style (Single)"
      },
      {
        type: "option",
        attrs: {
          value: "overlay"
        },
        innerHTML: "Overlay (Multiple Anchor Top-left)"
      },
      {
        type: "option",
        attrs: {
          value: "individual"
        },
        innerHTML: "Individual (Multiple, Separate Image)"
      }
    ]
  });
  clear_button = new Cel({
    type: "button",
    innerHTML: "Clear",
    on: {
      click: doClear
    }
  });
  start_button = new Cel({
    type: "button",
    innerHTML: "Start",
    on: {
      click: startRender
    }
  });
  start_image_button = new Cel({
    type: "button",
    innerHTML: "Start image render",
    on: {
      click: startImageRender
    }
  });
  var container = new Cel({
    children: [
      {
        children: [
          {
            type: "h6",
            innerText: "Web worker integration"
          }
        ]
      },
      {
        type: "label",
        innerHTML: "n",
        attrs: { for: "n" }
      },
      n_input,
      {
        type: "label",
        innerHTML: "v",
        attrs: { for: "v" }
      },
      v_input,
      {
        type: "label",
        innerHTML: "image",
        attrs: { for: "image" }
      },
//      image_input,
      style_select,
      start_button,
//      start_image_button,
//      {
//        type: "label",
//        innerHTML: "Enable overlay:",
//        attrs: { for: "overlay" }
//      },
      start_button,
      clear_button,
      {
        classes: ["workers"],
        innerText: "worker list"
      }
    ]
  });

  document.body.appendChild(container);

  function startRender() {
    var n,v,style;

    n = Number.parseInt(n_input.value);
    v = Number.parseInt(v_input.value);
    assert("N and V are integers", Number.isInteger(n), Number.isInteger(v));
    style = style_select.value;

    if (n > 4000) {
      var doContinue = confirm("You entered an n greater than 4000 (n="+n+"). This may take a long time. Proceed?");
      if (!doContinue) return;
    }

    //Hide the container
    container.style.display = "none";

    draw(n, v,style);

    //Show the container again
    container.style.display = "";
  }

  function startImageRender() {
    var n,v,image_url,image;
    var image_canvas, image_ctx, image_id,data;

    n = Number.parseInt(n_input.value);
    v = Number.parseInt(v_input.value);

    assert("N and V are integers", Number.isInteger(n), Number.isInteger(v));
    assert("A file is selected", image_input.files.length > 0);
    image_url = URL.createObjectURL(image_input.files[0]);
    console.log(image_url);
    assert("Image url is not empty", image_url.length > 0);

    image = new Image;



   image.onload = drawImageToCanvas;
   image.src = image_url;

   function drawImageToCanvas(e) {
     image_canvas = new Cel({
      type: "canvas",
      attrs: {
        width: image.width,
        height: image.height
      }
     });
     image_ctx = image_canvas.getContext("2d");
     document.body.appendChild(image_canvas);

     image_ctx.drawImage(image, 0, 0);

     image_id = image_ctx.getImageData(0, 0, image.width,image.height);
     data = image_id.data;
     for (var i = 0; i < data.length; i++) {
      var _r = i + 0,
          _g = i + 1,
          _b = i + 2,
          _a = i + 3;
      var r = data[_r],
          g = data[_g],
          b = data[b];
      r++;
      g++;
      b++;
      data[_r] = r;
      data[_g] = g;
      data[_b] = b;
     }
     image_ctx.putImageData(image_id, 0, 0);
   }

  }

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
    function draw(n, v,style) {
      n = Number.isInteger(n) ? n : _n;
      v = Number.isInteger(v) ? v : _n;

      var myWorker = new Worker("./worker.js");
      //Add to worker list
      document.querySelector(".workers").appendChild(new Cel({
        classes:["worker","n"+n+"v"+v],
        innerText: "n: " + n + " v: " + v
      }));
      myWorker.onmessage = function(e) {
        //Remove from worker list
        document.querySelector(".worker.n"+n+"v"+v).remove();
        var overlay = {
          classes: ["overlay"],
          children: [
            {
              classes: ["spinner"]
            },
            {
              innerText: "Generating..."
            },
            {
              innerText: "n="+n+" v="+v
            }
          ]
        };
        var canvas = new Cel({
          type: "canvas",
          attrs: {
            width: n,
            height: n
          }
        });
        var ctx = canvas.getContext("2d");
        var data = e.data;
        console.log(data, "from worker");
        overlay = new Cel(overlay);
        document.body.appendChild(overlay);
        setTimeout(function() {
          console.log("Teem oot!");
        drawPixelsToCanvas(ctx,style,data.pixels,n);
        var img = new Cel({
          type: "img",
          classes: ["render"],
          attrs: {
            width: n*2,
            height: n*2,
            src: ctx.canvas.toDataURL()
          }
        });
        document.body.appendChild(img);
        overlay.remove();
        myWorker.terminate();
        },50);

      }
      myWorker.postMessage([n,v]);
      /*
      if (style === 'individual' || style === 'overlay') {
        if (n < 1) return;
        draw(n-1, v);
      }
      */
    }
    function doClear() {
      container.remove();
      document.body.innerHTML = "";
      document.body.appendChild(container);
    }
    function drawPixelsToCanvas(ctx,style,pixels,n) {
      var id = ctx.createImageData(n,n);
      console.log(pixels,"to da CANVAASS");
      for (var x = 0; x < n; x++) {
        for (var y = 0; y < n; y++) {
          var pixel = pixels[to1d(x,y,n)];

          try {
            id.data[0 * to1d(x,y,n)] = pixel.r;
            id.data[1 * to1d(x,y,n)] = pixel.g;
            id.data[2 * to1d(x,y,n)] = pixel.b;
            id.data[3 * to1d(x,y,n)] = pixel.a;
          } catch(e) {
            console.log(e, pixel, x, y, to1d(x,y));
          }


        }
      }
      ctx.putImageData(id, 0, 0);
    }
      function to1d(x, y,n) {
        return y * n + x; //where n is the # of columns (x)
      }
}())
