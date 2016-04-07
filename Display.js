var Display;

(function() {
  "use strict";
  Display = Object.create(Object);
  
  Display.prototype.genRandomColour = function () {
    /*one liner from http://www.paulirish.com/2009/random-hex-color-code-snippets/ */
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };
  /* basic localStorage wrapper with shoddy hash table caching */
  Display.prototype.storage = (function () {
    var key = "canvases";
    function prepareStorage() { var s=window.localStorage;if (JSON.parse(s.getItem(key)) === null) s.setItem(key, "{}"); }
    
    prepareStorage();
    var get = function(id) {
      prepareStorage(); //ensures that our localStorage is in working condition
      var storage = JSON.parse(window.localStorage.getItem(key));
      return storage[id];
    };
    var set = function(id, value) {
      prepareStorage(); //ensures that our localStorage is in working condition
      var storage = JSON.parse(window.localStorage.getItem(key));
      if (storage === null) {
        window.localStorage.setItem(key, "{}");
        storage = JSON.parse(window.localStorage.getItem(key));
      }
      storage[id] = value;
      try {
      window.localStorage.setItem(key, JSON.stringify(storage));
      } catch(err) {
        console.log("Error saving item to LS!");
      }
    };
    /* return an object as a wrapper to storage */
    return {
      get: get,
      set: set
    };
  }());
})();