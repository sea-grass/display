onmessage = function(e) {
  var n,v,pixels,colour,last_colour;
  n = Number.parseInt(e.data[0]);
  v = Number.parseInt(e.data[1]);

  pixels = new Array(n*n);
  colour = {
    r: 0,
    g: 0,
    b: 0,
    a: 255
  };
  last_colour = colour;
  for (var x = 0; x < n; x++) {
    for (var y = 0; y < n; y++) {
      var i = to1d(x,y,n);

      /*
      colour.b = last_colour.b + v;
      while (colour.b > 255) {
        colour.b = colour.b - 255;
        colour.g += v;
        while (colour.g > 255) {
          colour.g = colour.g - 255;
          colour.r += v;
          while (colour.r > 255) {
            colour.r = colour.r - 255;
            colour.b += v;
          }
        }
      }
      */
      colour.b = last_colour.b + v;
      if (colour.b > 255) {
        colour.b -= 255;
        colour.g += v;
        if (colour.g > 255) {
          colour.g -= 255;
          colour.r += v;
          if (colour.r > 255) {
            colour.r -= 255;
          }
        }
      }

      pixels[i] = {
        r: colour.r,
        g: colour.g,
        b: colour.b,
        a: colour.a
      };
      last_colour = colour;
    }
  }

  postMessage({pixels: pixels, n: n, v: v});
}

function to1d(x,y,n) {
  return x * n + y;
}
