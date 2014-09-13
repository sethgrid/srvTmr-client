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
            console.log("timer started");
            if (!interval) {
              offset   = Date.now();
              interval = setInterval(update, options.delay);
            }
          }

          function stop() {
            console.log("timer stopped");
            if (interval) {
              clearInterval(interval);
              interval = null;
              render();
            }
          }

          function reset() {
            console.log("timer reset");
            clock = 0;
            render();
          }

          function update() {
            clock += delta();
            render();
          }

          function render() {
            elems = document.getElementsByClassName(elem);
            if (elems.length == 1){
              // clock is number of milliseconds
              mins   = Math.floor(clock / 1000 / 60);
              secs   = mins - Math.floor(clock / 1000);
              tenths = secs - Math.floor(clock / 100);
              elems[0].innerHTML = display(clock);
            }
          }

          function delta() {
            var now = Date.now(),
                d   = now - offset;

            offset = now;
            return d;
          }

          function display(t){
            tenths  = ""+Math.floor((t / 100) % 10);
            seconds = "0"+Math.floor((t / 1000) % 60);
            minutes = "0"+Math.floor((t / (1000 * 60)) % 60);
            m = minutes.substr(-2);
            s = seconds.substr(-2);
            tn = tenths.substr(-2);

            state = "<span class='arrow'>▶<span>"
            if (interval){
              state = "<span class='arrow'>▐▐&nbsp;&nbsp;&nbsp;<span>"
            }
            return "<span class='stopwatch'><span class='mins'>"+m+"</span>:<span class='secs'>"+s+"</span>.<span class='tenths'>"+tn+"</span></span><input id='timer-value' type='hidden' value='"+t+"' name='time'><br>"+state;
          }

          // public API
          this.start  = start;
          this.stop   = stop;
          this.reset  = reset;
        };

    module.exports = Stopwatch;

});