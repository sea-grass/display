/**
 *  Upon receiving image data values from the client, generate
 *  image data to be rendered by the client
 *  Returns:
 *  @imageData - A Uint8Array[n*n*4] with rgba values for the n*n pixels
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
  var data = new Uint8Array(options.width * options.height * 4);
  var n = options.width; //assuming width and height are the same
  var lastPixel = new Uint8Array([0, 0, 0, 255]);
  for (var x = 0; x < options.width; x++) {
    for (var y = 0; y < options.height; y++) {
      var thisPixel, i;
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
      i = to1d(x, y, n);
      data[i * 4 + 0] = thisPixel[0];
      data[i * 4 + 1] = thisPixel[1];
      data[i * 4 + 2] = thisPixel[2];
      data[i * 4 + 3] = thisPixel[3];

      lastPixel[0] = thisPixel[0];
      lastPixel[1] = thisPixel[1];
      lastPixel[2] = thisPixel[2];
      lastPixel[3] = thisPixel[3];
    }
  }

  return data;
}

function lastPixelGen(data) {
  var thisPixel = new Uint8Array(data.prev);
  var v = data.v;

  //with uint8 we get our mod behaviour for free
  if ((thisPixel[2] += v) > 255) {
    if ((thisPixel[1] += v) > 255) {
      if ((thisPixel[0] += v) > 255) {
        //do nothing here...yet
      }
    }
  }

  return thisPixel;
}

function to1d(x, y, n) {
  return y * n + x;
}
