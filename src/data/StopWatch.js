define(function(require, exports, module) {
      var Stopwatch = function(elem, options) {

          var timer       = createTimer(),
              startButton = createButton("start", start),
              stopButton  = createButton("stop", stop),
              resetButton = createButton("reset", reset),
              offset,
              clock,
              interval;

          // default options
          options = options || {};
          options.delay = options.delay || 1;

          // initialize
          reset();

          // private functions
          function createTimer() {
            //return document.createElement("span")
            a = document.createElement("input");
            a.type = "text";
            a.name = "time";
            a.value = "0";
            return a
          }

          function createButton(action, handler) {
            var a = document.createElement("input");
            a.type = "button"
            a.value = action;

            a.addEventListener("click", function(event) {
              handler();
              event.preventDefault();
            });
            return a;
          }

          function start() {
            console.log("started");
            if (!interval) {
              offset   = Date.now();
              interval = setInterval(update, options.delay);
            }
          }

          function stop() {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }

          function reset() {
            clock = 0;
            render();
          }

          function update() {
            clock += delta();
            render();
          }

          function render() {
            console.log("looking for class:", elem);
            elems = document.getElementsByClassName(elem);
            if (elems.length == 1){
              elems[0].innerHTML = clock/1000;
            }
          }

          function delta() {
            var now = Date.now(),
                d   = now - offset;

            offset = now;
            return d;
          }

          // public API
          this.start  = start;
          this.stop   = stop;
          this.reset  = reset;
        };

    module.exports = Stopwatch;

});