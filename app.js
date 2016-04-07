/* display/app.js -- used to create canvases and sheit, but I got halfway through
  refactoring and now it doesn't work. Need to investigate. */

/*listen for all window errors*/
window.addEventListener("error", function(errorMsg, url, lineNum) {
  var errorEl;
  errorEl = document.createElement("div");
  errorEl.innerText = errorMsg + " @ " + url + ":" + lineNum;
  document.body.appendChild(errorEl);
});

(function() {
  "use strict";
  //primary ui html elements
  var ui, info, btn, nLabel, nInput, vLabel, vInput, uwLabel, uwInput, cnvs, cnv;
  //secondary ui html elements
  var cnvs, cnv, loadingMessage;
  //other useful constructs
  var screenshot = {};
  var dim;
  
  /* Utilities */
  //Ui box
  ui = new Cel({
    style: {
      "position": "fixed",
      "z-index": "2",
      "top": "0px",
      "right": "0px"
    }
  });
  //How-to dialogue
  info = ui.appendChild(new Cel({
    style: {
      "width": "150px"
    },
    children: [
      new Cel({
        type: "h3",
        innerText: "Colour Block Generator"
      }),
      new Cel({
        type: "p",
        innerText: "I don't know what this is yet."
      }),
      new Cel({
        type: "p",
        innerText: "This produces an n x n (n by n) pixel image, where the value of v is the variance of colour between each adjacent pixel"
      }),
      new Cel({
        type: "p",
        innerText: "In short: Enter a low n (try around 30-40). Enter a v such that 0 < v < 256."
      }),
      new Cel({
        type: "p",
        innerHTML: "<i>Uses <a href='http://html2canvas.hertzen.com/'>html2canvas</a> and a whole lotta divs</i>"
      })
    ]
  }));
  //Button to generate the image
  btn = ui.appendChild(new Cel({
    type: "button",
    "innerHTML": "Generate image"
  }));
  //n (x and y dimensions) label
  nLabel = ui.appendChild(new Cel({
    type: "label",
    attrs: {
      "for": "n"
    },
    "innerText": "n:"
  }));
  //n (x and y dimensions) input
  nInput = ui.appendChild(new Cel({
    type: "input",
    id: "n",
    attrs: {
      "name": "n",
      "type": "text",
      "value": 40
    },
    style: {
      "width": "60px"
    }
  }));
  //Variance label
  vLabel = ui.appendChild(new Cel({
    type: "label",
    attrs: {
      "for": "v"
    },
    "innerText" : "v:"
  }));
  //Variance input
  vInput = ui.appendChild(new Cel({
    type: "input",
    id: "v",
    attrs: {
      "name": "v",
      "type": "text",
      "value": 11
    },
    style: {
      "width": "60px"
    }
  }));
  //unitWidth & unitHeight: TODO
  var uwInput, uwLabel;
  uwInput = document.createElement("input");
  uwLabel = document.createElement("label");
  uwInput.value = 1;
  uwLabel.innerText="uW";
  //loading message
  loadingMessage = new Cel({
    "type": "p",
    "innerText": "Loading next iteration..."
  });
  //cnvs, short for canvases, will hold the current "picture" of each saved iteration
  cnvs = document.body.appendChild(new Cel({
    "style": {
      "position": "absolute",
      "top": "0px",
      "left": "0px", width: "100px", height: "100px"
    }
  }));
  btn.addEventListener("click", generateFullImage);
  //Now add ui to document.body
  document.body.appendChild(ui);
  /*helpers*/
  /* generateFullImage -- */
  function generateFullImage(e) {
    var x, y, uw, uh, n, v, promptMessage;
    var bigX, bigY, bigUW, bigUH; // TODO: I don't understand the meaning of these variables
    n = nInput.value; //n is the size of the canvas (we will draw n*n pixels)
    v = vInput.value;
    
    // If n is large, it may take a long time.
    if (n > 100) {
      promptMessage = "You entered n=+" + n + ". This may take a long time. Proceed?";
      if (!confirm(promptMessage)) {
        return false;
      }
    }
    // Hide ui elements
    ui.style.display = "none";
    // Show loading message
    document.body.appendChild(loadingMessage);
    // Show all 1x1 -> nxn canvases
    bigX = 0;
    bigY = 0;
    bigUW = 0;
    bigUH = 0;
    dim = 5;
    x = n;
    y = n;
    uw = dim;
    uh = dim;
    newCanvas(x, y, uw, uh, v);
    /* newCanvas(x, y, uw, uh, v) -- does something */
    function newCanvas(x, y, uw, uh, v) {
      var cnv, saved, img;
      if (v < 0) v = v * -1;
      if (bigX < x) bigX = x;
      if (bigY < y) bigY = y;
      if (bigUW < uw) bigUW = uw;
      if (bigUH < uh) bigUH = uh;
      //Clear the previous picture from the document
      /*if (screenshot.canvas) {
            screenshot.canvas.remove();
            delete screenshot.canvas;
      }*/
      saved = Display.storage.get("x"+x+"y"+y+"v"+v);
      if (saved) {
        img = new Image();
        img.src = saved;
        img.style.position = "absolute"
        img = cnvs.appendChild(new Cel({
          "type": "img",
          "attrs": {
            "src": saved
          },
          "style": {
            "position": "absolute",
            "top": "0px"
          }
        }));
        img.addEventListener("load", function(e) {
          newCanvas(x-1, y-1, uw, uh, v);
        });
      } else {
        window.setTimeout(bimbibap, 1000/60);
      }
    }
    /* bimbibap(e) -- event listener for a timeout; placeholder name */
    function bimbibap(e) {
      if (x > 1 && y > 1) {
        cnv = new Canvas(x, y, uw, uh).populate(v).element;
        cnvs.appendChild(cnv);
        //take a screenshot of this form, and remove the cnvs that were just added
        html2canvas(document.body, {
          width: bigX * bigUW,
          height: bigY * bigUH,
          onrendered: onrendered
        });
      } else {
        //Take a screenshot of the final form, and replace all of these divs with it
        //Now take a screenshot of size n x n
        html2canvas(document.body, {
          width: bigX * bigUW,
          height: bigY * bigUH,
          onrendered: onfinalrendered
        });
      }
    }
    /* onrendered(canvas) -- run when the html2canvas canvas has been rendered */
    function onrendered(canvas) {
      var pngUrl;
      
      screenshot.canvas = canvas;
      
      while (cnvs.firstChild) cnvs.removeChild(cnvs.firstChild);
      cnvs.appendChild(canvas);
      
      canvas.style.position = "absolute";
      canvas.style.top = "0px";
      canvas.style.left = "0px";
      
      pngUrl = canvas.toDataURL();
      Display.storage.get("x"+x+"y"+y+"v"+v, pngUrl);
      x--; // i refactored the code and now these are global...ayeayeaye
      y--; //
      newCanvas(x, y, uw, uh, v);
    }
    /* onfinalrendered(canvas) -- run when the last canvas has been rendered */
    function onfinalrendered(canvas) {
      var pngUrl;
      
      screenshot.canvas = canvas;
      
      //clear the canvases
      while(cnvs.firstChild) cnvs.removeChild(cnvs.firstChild);
      //add the final canvas to the body
      canvas.classList.add("rendered");
      document.body.appendChild(canvas);
      //Remove loading message from body
      loadingMessage.remove();
      //Set new canvas image as document.body background
      pngUrl = canvas.toDataURL();
      document.body.style.backgroundImage = "url(" + pngUrl + ") repeat";
      //Save the image to storage
      Display.storage.set("x"+x+"y"+y+"v"+v, pngUrl);
      //Restore ui elements
      ui.style.display="block";
    }
  }
})();

  
