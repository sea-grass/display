/* Canvas.js -- a div-based pixel canvas -- TODO: Would probably be better as a custom element, perhaps? */
var Canvas;
(function() {
  "use strict";
  /* Canvas constructor */
  Canvas = function(/*w, h, uW, uH*/) {
    if (arguments.length != 2 && arguments.length != 4) throw "Error! Invalid Canvas def'n.";
    /* get values of w, h, uw, uh from arguments */
    this.X = Number.parseInt(arguments[0]);
    this.Y = Number.parseInt(arguments[1]);
    if (arguments.length == 2) {
      this.unitWidth = 1;
      this.unitHeight = 1;
    } else if (arguments.length == 4) {
      this.unitWidth = Number.parseInt(arguments[2]);
      this.unitHeight = Number.parseInt(arguments[3]);
    }
    
    this.pixels = [];
    
    this.element = new Cel({
      classes: ["canvas"],
      style: {
        "position": "absolute",
        "top": "0",
        "left": "0",
        "width": "" + (this.X*this.unitWidth) + "px",
        "height": "" + (this.Y*this.unitHeight) + "px"
      }
    });
    this._colourGenerator = new ColourGenerator();
    this._colourVariator = 1;
    
    Object.defineProperty(this, "newColour", {
      get: function() {
        return this._colourGenerator(this._colourVariator);
      }, set: function(val) {}
    });
    
    return this;
  };
  /* methods -- all should be chainable */
  Canvas.prototype.clear = function (){
    while (this.element.children.length > 0) this.element.children[0].remove();
    return this;
  };
  Canvas.prototype.populate = function (colourVariator) {
    this._colourVariator = colourVariator;
    for (var x = 0; x < this.X; x += 1) {
      for (var y = 0; y < this.Y; y += 1) {
        var pixel;
        //Create a pixel for this location
        pixel = new Pixel(x, y, this.unitWidth, this.unitHeight);
        pixel.setColour(this.newColour);
        this.placePixel(pixel);
      }
    }
    return this;
  };
  Canvas.prototype.placePixel = function (pixel) {
    if (!this.pixels[pixel.x]) this.pixels[pixel.x] = [];
    this.pixels[pixel.x][pixel.y] = pixel;
    this.element.appendChild(pixel.element);
  };
})();