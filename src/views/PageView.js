// consider ui inspiration: http://hellowoo.com/wp-content/uploads/2013/10/future-UI-031.jpg
// TODO: this file should prolly be broken up into multiple views. A timer view, a stats view...
define(function(require, exports, module) {
    var View            = require('famous/core/View');
    var Surface         = require('famous/core/Surface');
    var Transform       = require('famous/core/Transform');
    var EventHandler    = require('famous/core/EventHandler');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var HeaderFooter    = require('famous/views/HeaderFooterLayout');
    var ImageSurface    = require('famous/surfaces/ImageSurface');
    var Utility         = require('famous/utilities/Utility');
    var Timer           = require('famous/utilities/Timer');
    var Easing          = require('famous/transitions/Easing');

    var StopWatch       = require('data/StopWatch');

    function PageView() {
        View.apply(this, arguments);

        _createBacking.call(this);
        _createLayout.call(this);
        _createHeader.call(this);
        _createTimer.call(this);
        _createStats.call(this);

        _setListeners.call(this);
        _getStats.call(this);
        _updateStatsSurface.call(this);
    }

    PageView.prototype = Object.create(View.prototype);
    PageView.prototype.constructor = PageView;

    PageView.DEFAULT_OPTIONS = {
        geoData: {},
        stopwatch: {},
        backendUrl: "http://srvtmr.herokuapp.com",
        headerSize: 44,
        timerRunning: false,
        lastSubmission: 0,
        submissionBuffer: 10000, // ms
        statsUrlQuery: "",
        placeStats: {},
        selectedPlace: "",
    };

    // solid color background. will be covered up by other surfaces.
    function _createBacking() {
        var backing = new Surface({
            properties: {
                backgroundColor: 'black',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }
        });

        this.add(backing);
    }

    // sets up the header
    function _createLayout() {
        this.layout = new HeaderFooter({
            headerSize: this.options.headerSize
        });

        var layoutModifier = new StateModifier({
            transform: Transform.translate(0, 0, 0.1)
        });

        this.add(layoutModifier).add(this.layout);
    }

    // the header is the select drop down box
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

    // clock face, submit, reset, and submitted confirmation surfaces and modifiers
    function _createTimer() {
        this.bodySurface = new Surface({
            size : [undefined, undefined],
            properties: {
                backgroundColor: '#003333', // deep blue
                color: '#669999',
            },
        });

        this.timerSurface = new Surface({
            size: [200, 200],
            content : "<span class='stopwatch'><span class='mins'>00</span>:<span class='secs'>00</span>.<span class='tenths'>0</span></span><input id='timer-value' type='hidden' value='00:00.0' name='time'><br><span class='arrow'>▶<span>",
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
                backgroundColor: '#801515', // deep red
                color: '#FFAAAA',
            },
        });

        var resetModifier = new StateModifier({
            origin: [0.5, 1.6],
            align:  [0.15, 0.2],
        });

        this.submitSurface = new Surface({
            size: [66, 66],
            content: '✓',
            properties: {
                borderRadius: '33px',
                textAlign: 'center',
                paddingTop: '4px',
                paddingLeft: '0px',
                backgroundColor: '#567714', // green
                fontSize: '48px',
                color: '#D4EE9F',
            },
        });

        var submitModifier = new StateModifier({
            origin: [0.5, 1.6],
            align:  [0.85, 0.55],
        });

        this.submittedSurface = new Surface({
            size: [100, 100],
            content: 'OK!',
            properties: {
                backgroundColor: '#669999',
                color: 'white',
                fontSize: '64px',
                borderRadius: '50px',
                paddingLeft: '2px',
                paddingTop: '10px',
            },
        });

        this.submittedModifier = new StateModifier({
            origin: [0.5, 0.95],
            align: [0.5, 0.5],
            // sets initial x- and y-scale to be 0
            transform: Transform.scale(0, 0, 1),
            // sets inital opacity to 0
            opacity: 0
        });

        this.layout.content.add(this.bodySurface);
        this.layout.content.add(timerModifier).add(this.timerSurface);
        this.layout.content.add(resetModifier).add(this.resetSurface);
        this.layout.content.add(submitModifier).add(this.submitSurface);
        this.layout.content.add(this.submittedModifier).add(this.submittedSurface);
    }

    // stats surface and modifiers
    function _createStats() {
        this.statsSurface = new Surface({
            size: [undefined, undefined],
            content: "                                        \
                    <table id='stats_table'>                    \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                Average                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                0    \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='odd'>                        \
                            <td class='left_cell'>              \
                                Median                          \
                            </td>                               \
                            <td class='right_cell'>             \
                                0      \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                90th Percentile                 \
                            </td>                               \
                            <td class='right_cell'>             \
                                0    \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='odd'>                        \
                            <td class='left_cell'>              \
                                Fastest                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                0     \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                Slowest                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                0     \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                    </table>                                    \
                                                                \
                ",
            properties: {
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

    function _getStats(){
        Timer.setTimeout(function(){
            if (!window.stats_url_query){
                _getStats.call(this);
            } else {
                // why don't I have 'this'?
                // next: when query is available, call to it and get data back
                this.options.statsUrlQuery = window.stats_url_query
                Utility.loadURL(this.options.backendUrl+"/stats?"+this.options.statsUrlQuery, function(response){
                    this.options.placeStats = JSON.parse(response);
                }.bind(this));
            }
        }.bind(this), 250);
    }

    // periodically update the stats surface to catch if the user has changed the select box option
    function _updateStatsSurface(){
        Timer.setInterval(function(){
            placeID = getSelectedPlace();
            // update stats panel
            this.statsSurface.setContent(getRecord(this.options.placeStats, placeID))
        }.bind(this), 250)
    }

    // famous does not want me modifying the dom directly. i'm not yet sure how to get around this here.
    function getSelectedPlace(){
        var e = document.getElementById("select-box");
        if (!e || e.length == 0){
            return
        }
        if (!e.selectedIndex){  e.selectedIndex = 0; };
        var place_id = e.options[e.selectedIndex].value;
        return place_id;
    }

    // formats the json data for the stats panel
    function getRecord(jsonDatas, ID){
        console.log("looking for ", ID, jsonDatas)
        for (var i=0; i<jsonDatas.length; i++){
            console.log(jsonDatas[i])
            if (jsonDatas[i]["ID"] == ID){
                // TODO: change this to a function call
                return "                                        \
                    <table id='stats_table'>                    \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                Average                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                "+jsonDatas[i]["Average"]+"     \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='odd'>                        \
                            <td class='left_cell'>              \
                                Median                          \
                            </td>                               \
                            <td class='right_cell'>             \
                                "+jsonDatas[i]["Median"]+"      \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                90th Percentile                 \
                            </td>                               \
                            <td class='right_cell'>             \
                                "+jsonDatas[i]["Percentile_90th"]+"     \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='odd'>                        \
                            <td class='left_cell'>              \
                                Fastest                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                "+jsonDatas[i]["Fastest"]+"     \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                Slowest                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                "+jsonDatas[i]["Slowest"]+"     \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                    </table>                                    \
                                                                \
                ";
            }
        }
        return  "                                               \
                    <table id='stats_table'>                    \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                Average                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                0                               \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='odd'>                        \
                            <td class='left_cell'>              \
                                Median                          \
                            </td>                               \
                            <td class='right_cell'>             \
                                0                               \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                90th Percentile                 \
                            </td>                               \
                            <td class='right_cell'>             \
                                0                               \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='odd'>                        \
                            <td class='left_cell'>              \
                                Fastest                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                0                               \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                        <tr class='even'>                       \
                            <td class='left_cell'>              \
                                Slowest                         \
                            </td>                               \
                            <td class='right_cell'>             \
                                0                               \
                                <span class='small'>sec</span>  \
                            </td>                               \
                        </tr>                                   \
                    </table>                                    \
                                                                \
                ";
    }

    // most (all?) event handling. There are some outside timed events, but clicks and whatnot happen here.
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
                this.options.stopwatch.start();
            } else {
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
            if (this.options.lastSubmission < new Date().getTime() - this.options.submissionBuffer){ // prevent accidental duplicate submits within x ms
                this.options.lastSubmission = new Date().getTime();
                var e = document.getElementById("select-box");
                var place_id = e.options[e.selectedIndex].value;
                var time = document.getElementById('timer-value');

                Utility.loadURL(this.options.backendUrl+"/submit?place_id="+place_id+"&time="+time.value, function(response){
                    this.submittedModifier.setTransform(
                        Transform.scale(1, 1, 1),
                        { duration : 2000, curve: Easing.outBack }
                    );

                    this.submittedModifier.setOpacity(1, {
                        duration: 2000, curve: Easing.outBack
                    });

                    this.submittedModifier.setOpacity(1, {
                        duration: 2000, curve: Easing.outBack
                    });

                    this.submittedModifier.setTransform(
                        Transform.scale(0, 0, 0),
                        { duration : 2000, curve: Easing.outBack }
                    );
                }.bind(this));
            }
        }.bind(this));
    }

    module.exports = PageView;
});
