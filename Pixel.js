/* Pixel.js */
var Pixel;

(function() {
  "use strict";
  
  /*Pixel() constructor */
  Pixel = function() {
    if (arguments.length != 2 && arguments.length != 4) throw "Invalid instantiation of Pixel";
    this.x = Number.parseInt(arguments[0]);
    this.y = Number.parseInt(arguments[1]);
    if (arguments.length == 2) {
      this.w = 1;
      this.h = 1;
    } else if (arguments.length == 4) {
      this.w = Number.parseInt(arguments[2]);
      this.h = Number.parseInt(arguments[3]);
    }
    
    this.element = new Cel({
      classes: ["pixel"],
      style: {
        "position": "absolute",
        "top": "" + (this.y*this.h) + "px",
        "left": "" + (this.x*this.w) + "px",
        "width": "" + this.w + "px",
        "height": "" + this.h + "px"
      }
    });
    
    Object.defineProperty(this, "colour", {
    get: function() { return this._colour || ""; },
    set: function(val) {
      this._colour = val;
      
      this.element.style.backgroundColor = this._colour;
    }
  });
    /* methods */
    Pixel.prototype.setColour = function(colour) {
      
      this.colour = colour;
      //this.colour = "red";
    };
  };
})();