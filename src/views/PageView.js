define(function(require, exports, module) {
    var View            = require('famous/core/View');
    var Surface         = require('famous/core/Surface');
    var Transform       = require('famous/core/Transform');
    var EventHandler    = require('famous/core/EventHandler');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var HeaderFooter    = require('famous/views/HeaderFooterLayout');
    var ImageSurface    = require('famous/surfaces/ImageSurface');

    var StopWatch       = require('data/StopWatch');

    function PageView() {
        View.apply(this, arguments);

        _createBacking.call(this);
        _createLayout.call(this);
        _createHeader.call(this);
        _createTimer.call(this);
        _createStats.call(this);

        _setListeners.call(this);
    }

    PageView.prototype = Object.create(View.prototype);
    PageView.prototype.constructor = PageView;

    PageView.DEFAULT_OPTIONS = {
        geoData: {},
        stopwatch: {},
        headerSize: 44,
        timerRunning: false,
    };

    function _createBacking() {
        var backing = new Surface({
            properties: {
                backgroundColor: 'black',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }
        });

        this.add(backing);
    }

    function _createLayout() {
        this.layout = new HeaderFooter({
            headerSize: this.options.headerSize
        });

        var layoutModifier = new StateModifier({
            transform: Transform.translate(0, 0, 0.1)
        });

        this.add(layoutModifier).add(this.layout);
    }

    function _createHeader() {
        var backgroundSurface = new Surface({
            content: '<div class="styled-select"><select id="select-box"></select></div>',
            properties: {
                backgroundColor: 'white',
                color: 'blue',
            }
        });

        var backgroundModifier = new StateModifier({
            transform : Transform.behind
        });

        this.layout.header.add(backgroundModifier).add(backgroundSurface);
    }

    function _createTimer() {
        this.bodySurface = new Surface({
            size : [undefined, undefined],
            properties: {
                backgroundColor: '#192235',
                color: 'red',
            },
        });

        this.timerSurface = new Surface({
            size: [200, 200],
            content : "<span class='stopwatch'><span class='mins'>00</span>:<span class='secs'>00</span>.<span class='tenths'>0</span></span><input id='timer-value' type='hidden' value='00:00.0' name='time'>",
            properties: {
                borderRadius: '100px',
                textAlign: 'center',
                fontSize: '44px',
                paddingTop: '65px',
                backgroundColor: 'white',
            },
        });

        var timerModifier = new StateModifier({
            origin: [0.5, 1.2],
            align : [0.5, 0.5],
        });

        this.resetSurface = new Surface({
            size: [50, 50],
            content: '↻',
            properties: {
                borderRadius: '25px',
                textAlign: 'center',
                paddingTop: '0px',
                fontSize: '36px',
                backgroundColor: '#FA5C4F',
                color: '#FF8080',
            },
        });

        var resetModifier = new StateModifier({
            origin: [0.5, 1.6],
            align:  [0.15, 0.2],
        });

        this.submitSurface = new Surface({
            size: [66, 66],
            content: '▶',
            properties: {
                borderRadius: '33px',
                textAlign: 'center',
                paddingTop: '4px',
                paddingLeft: '10px',
                backgroundColor: 'lime',
                fontSize: '48px',
                color: '#FFFF99',
            },
        });

        var submitModifier = new StateModifier({
            origin: [0.5, 1.6],
            align:  [0.85, 0.55],
        });


        this.layout.content.add(this.bodySurface);
        this.layout.content.add(timerModifier).add(this.timerSurface);
        this.layout.content.add(resetModifier).add(this.resetSurface);
        this.layout.content.add(submitModifier).add(this.submitSurface);
    }

    function _createStats() {
        this.statsSurface = new Surface({
            size: [undefined, undefined],
            content: 'stats',
            properties: {
                borderRadius: '5px',
                textAlignt: 'center',
                paddingTop: '5px',
                backgroundColor: '#E6E6F0',
            },
        });

        var statsModifier = new StateModifier({
            origin: [0.5, 0],
            align: [0.5, 0.5],
        });

        this.layout.content.add(statsModifier).add(this.statsSurface);
    }

    function _setListeners() {
        this.timerSurface.addClass("timer");

        this.options.stopwatch = new StopWatch("timer", {delay: 10});

        this.EventHandlerTimer = new EventHandler();

        this.timerSurface.on('click', function() {
            this.EventHandlerTimer.emit('timerToggle');
        }.bind(this));

        this.resetSurface.on('click', function(){
            this.EventHandlerTimer.emit('timerReset');
        }.bind(this));

        this.EventHandlerTimer.on('timerToggle', function(){
            this.options.timerRunning = !this.options.timerRunning;
            if (this.options.timerRunning){
                console.log('start');
                this.options.stopwatch.start();
            } else {
                console.log('stop');
                this.options.stopwatch.stop();
            }
        }.bind(this));

        this.EventHandlerTimer.on('timerReset', function(){
            this.options.stopwatch.reset();
        }.bind(this));

        this.submitSurface.on('click', function(){
            this.EventHandlerTimer.emit('timerSubmit');
        }.bind(this));

        this.EventHandlerTimer.on('timerSubmit', function(){
            var e = document.getElementById("select-box");
            var place_id = e.options[e.selectedIndex].value;
            var time = document.getElementById('timer-value');
            alert('submitting the following ' + place_id + " " +  time.value);
        }.bind(this));
    }

    module.exports = PageView;
});
