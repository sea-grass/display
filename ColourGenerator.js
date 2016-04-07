/* ColourGenerator.js -- */
var ColourGenerator;

(function() {
  "use strict";
  ColourGenerator = function() {
    var colours = [];
    
    //returns a function that will return the next hex colour string in a sequence
    return (function(r, g, b) {
      
      return function(inc) {
        if (!inc) inc = 1;
        return nextColour(inc);
      };
      /* helpers */
      function nextColour(inc) {
        var colour;
        if (!colours[r] || !colours[r][g] || !colours[r][g][b]) makeColour(r,g,b);
        
        colour = colours[r][g][b];
        /* increment the r,g,b values based on inc */
        inc = Number.parseInt(inc);
        if (b >= 255) {
          b = 0;
          g += inc;
          if (g >= 255) {
            g = 0;
            r += inc;
            if (r >= 255) {
              r = 0;
            }
          }
        } else {
          b += inc;
        }
        
        return colour;
      }
      /* makeColour(r,g,b) -- generates the hex string and saves it */
      function makeColour(r,g,b) {
        if (!colours[r]) colours[r] = [];
        if (!colours[r][g]) colours[r][g] = [];
        if (!colours[r][g][b]) colours[r][g][b] = hexString(r, g, b);
        return colours[r][g][b];
      }
      /* hexString() -- returns a hex colour string for r,g,b*/
      function hexString() {
        return "#" + to2Digits(r) + to2Digits(g) + to2Digits(b);
      }
      /* to2Digits(n) -- takes a number in base 16 and forces 2 digits */
      function to2Digits(n) {
        var num;
        
        if (n > 255) {
          if (n < 0) n *= -1; //we don't want negative #'s
          n = n % 256;
        }
        
        num = n.toString(16);
        
        if (num.length != 2) num = "0" + num;
        if (num.length != 2) return "00";
        
        return num;
      }
      
      
    })(0, 0, 0);
  };
})();