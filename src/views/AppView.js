/*** AppView.js ***/

define(function(require, exports, module) {
    var View            = require('famous/core/View');
    var Surface         = require('famous/core/Surface');
    var Modifier        = require('famous/core/Modifier');
    var Transform       = require('famous/core/Transform');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var Easing          = require('famous/transitions/Easing');
    var Transitionable  = require('famous/transitions/Transitionable');
    var GenericSync     = require('famous/inputs/GenericSync');
    var MouseSync       = require('famous/inputs/MouseSync');
    var TouchSync       = require('famous/inputs/TouchSync');
    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});

    var PageView      = require('views/PageView');

    function AppView() {
        View.apply(this, arguments);

        this.menuToggle = false;
        this.pageViewPos = new Transitionable(0);

        _createPageView.call(this);
    }

    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

    AppView.DEFAULT_OPTIONS = {
        geoData: {},
    };

    function _createPageView() {
        this.pageView = new PageView({geoData: this.options.geoData});
        this.pageModifier = new Modifier({
            transform: function() {
                return Transform.translate(0, 0, 0);
            }.bind(this)
        });

        this._add(this.pageModifier).add(this.pageView);
    }

    module.exports = AppView;
});
