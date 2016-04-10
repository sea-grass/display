/**
 *  Upon receiving image data values from the client, generate
 *  image data to be rendered by the client
 */
onmessage = function(e) {
  console.log("Worker received message", e);
  var n, v, pixels;
  n = Number.parseInt(e.data[0]);
  v = Number.parseInt(e.data[1]);

  imageData = generateImageData({
    width: n,
    height: n,
    generator: {
      /* name of the generator -- decides how to pass args to gen */
      name: "lastPixel",
      /* takes arguments and returns an object representing (some)
       * pixel data. */
      gen: lastPixelGen,
      options: {
        v: v
      }
    }
  });
  postMessage({
    imageData: imageData,
    n: n,
    v: v
  });
};

function generateImageData(options) {
  var data = new Array(options.width * options.height);
  var n = options.width; //assuming width and height are the same
  var lastPixel = {
    colour: {
      r: 0,
      g: 0,
      b: 0,
      a: 255
    }
  };
  for (var x = 0; x < options.width; x++) {
    for (var y = 0; y < options.height; y++) {
      var thisPixel;
      switch (options.generator.name) {
        //pass x, y, prev.colour as options to gen
        case 'lastPixel':
          var v = options.generator.options.v;
          thisPixel = options.generator.gen({
            x: x,
            y: y,
            v: v,
            prev: lastPixel
          });
      }
      data[to1d(x, y, n)] = thisPixel;
      lastPixel.colour = thisPixel.colour;
    }
  }

  return data;
}

function lastPixelGen(data) {
  var lastColour = data.prev.colour;
  var thisColour = {};
  var v = data.v;
  thisColour.r = lastColour.r;
  thisColour.g = lastColour.g;
  thisColour.b = lastColour.b;
  thisColour.a = lastColour.a;

  thisColour.b += v;
  if (thisColour.b > 255) {
    thisColour.b -= 255;
    thisColour.g += v;
    if (thisColour.g > 255) {
      thisColour.g -= 255;
      thisColour.r += v;
      if (thisColour.r > 255) {
        thisColour.r -= 255;
      }
    }
  }
  return {
    colour: thisColour
  };
}

function to1d(x, y, n) {
  return y * n + x;
}
