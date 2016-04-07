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
      clear_button
    ]
  });

  document.body.appendChild(container);

  function startRender() {
    var n,v,style;

    n = Number.parseInt(n_input.value);
    v = Number.parseInt(v_input.value);
    assert("N and V are integers", Number.isInteger(n), Number.isInteger(v));
    style = style_select.value;

    if (n > 300) {
      var doContinue = confirm("You entered an n greater than 300 (n="+n+"). This may take a long time. Proceed?");
      if (!doContinue) return;
    }

    //Hide the container
    container.style.display = "none";

    var canvas = new Cel({
      type: "canvas",
      attrs: {
        width: n,
        height: n,
        style: "border: 1px solid #ececec"
      }
    });
    var canvas_container = new Cel({
      classes: ['render'],
      children: [
        {
          innerHTML: "n="+n+" - v="+v
        },
        canvas
      ]
    });

    var ctx = canvas.getContext("2d");
    var id = ctx.createImageData(1, 1);
    //document.body.appendChild(canvas_container);
    document.body.appendChild(canvas);

    var draw = DrawFunc(n, v, ctx, id, style);

    draw(n, v);


    console.log("TODO, do like, stuff");




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
     /*
     for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
          data[y*image_canvas.width + x + 0] = 0;
          data[y*image_canvas.width + x + 1] = 0;
          data[y*image_canvas.width + x + 2] = 0;
          data[y*image_canvas.width + x + 3] = 0;
        }
     }
     */
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

    /**
     * DrawFunc
     * Returns a curried version of draw
     */
    function DrawFunc(_n, _v, ctx, id, style) {
      return draw;
    function draw(n, v) {
      n = Number.isInteger(n) ? n : _n;
      v = Number.isInteger(v) ? v : _n;

      var pixels = new Array(n*n);
      //starting pixel
      pixels.last = {
        r: 0,
        g: 0,
        b: 0,
        a: 255
      };

      function to1d(x, y) {
        return x * n + y; //where n is the # of columns (x)
      }
      id.data[0] = 0; //r
      id.data[1] = 0; //g
      id.data[2] = 0; //b
      id.data[3] = 255; //a
      for (var x = 0; x < n; x++) {
        for (var y = 0; y < n; y++) {
          var index = to1d(x, y);

          var r,g,b;

          r = pixels.last.r;
          g = pixels.last.g;
          b = pixels.last.b;

          b += v;
          if (b > 255) {
            b = b - 255;
            g += v;
            if (g > 255) {
              g = g - 255;
              r += v;
              if (r > 255) {
                r = r - 255;
              }
            }
          }

          pixels[index] = {
            r: r,
            g: g,
            b: b,
            a: 255
          };
          pixels.last = pixels[index];

          /*
           * Save the drawing for after all pixels have been calculated
          id.data[0] = r;
          id.data[1] = g;
          id.data[2] = b;

          ctx.putImageData(id, x, y);
          */
        }
      }
      switch (style) {

        case 'individual':
          var old_ctx = ctx, old_id = id;
          var new_canvas = new Cel({
            type: "canvas",
            attrs: {
              width: n,
              height: n
            }
          });
          //swap out the old canvas with the new one
          //TODO: See below 'meh' todo
          //ctx.canvas.parentElement.appendChild(new_canvas);
          ctx = new_canvas.getContext("2d");
          id = ctx.createImageData(1, 1);
        case 'overlay':
        default:
          //do nothing, use existing ctx value
      }
      for (var x = 0; x < n; x++) {
        for (var y = 0; y < n; y++) {
          var pixel = pixels[to1d(x,y)];

          id.data[0] = pixel.r;
          id.data[1] = pixel.g;
          id.data[2] = pixel.b;
          id.data[3] = pixel.a;

          ctx.putImageData(id, x, y);
        }
      }

      var img = new Cel({
        type:"img",
        
          attrs: {
            width: _n*2, 
            height: _n*2, 
            src: ctx.canvas.toDataURL()
          }
      });
      switch (style) {

        case 'individual':
          //add the old canvas back to the same parent as the other one
          //ctx.canvas.parentElement.appendChild(old_ctx.canvas);
          console.log("x");
          ctx.canvas.remove();
          //restore original values
          ctx = old_ctx;
          id = old_id;

          
        case 'overlay':
        default:
          //do nothing, use existing ctx value
      }
      //Swap out the canvas with the image version
      //TODO: Meh fix this swap later
      document.body.appendChild(img);
      //ctx.canvas.parentElement.appendChild(img);
      ctx.canvas.remove();
      if (style === 'individual' || style === 'overlay') {
        if (n < 1) return;
        draw(n-1, v);
      }
    }
    }
    function doClear() {
      container.remove();
      document.body.innerHTML = "";
      document.body.appendChild(container);
    }
}())
