/**
 * engin.js
 * A simple game engine.
 */
var Engin = {};

/**
 * A Game.
 * @param {[type]} params [description]
 */
Engin.Game = function(params) {
    this.platform = params.platform;
    this.assets = new Engin.Assets.AssetManager(this, params.assets.images, params.assets.sounds);
    this.globals = {};
}

/**
 * Defines the states part of this game.
 * @param  {[type]} states [description]
 * @return {[type]}        [description]
 */
Engin.Game.prototype.defineStates = function defineStates(states) {
    this.states = {};
    for (name in states) {
        this.states[name] = new states[name]();
        this.states[name].game = this;
        if (this.states[name].initialize) {
            this.states[name].initialize();
        }
    }
}

/**
 * Initializes the game's resources.
 * @return {[type]} [description]
 */
Engin.Game.prototype.initialize = function initialize(canvas) {
    this.assets.load();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = new Engin.Input.Handler[this.platform](this);
};

Engin.Game.prototype.start = function start() {
    this.state = this.states.initial;
    
    if (this.states.initial.enter) {
        this.states.initial.enter();
    }

    var game = this;
    setInterval(function loop() {
        if (game.state.update) {
            game.state.update(50);
        }
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        if (game.state.render) {
            game.state.render();
        }
    }, 50);
};

Engin.Game.prototype.switchState = function switchState(name) {
    var prevState = this.state;
    var nextState = this.states[name];

    if (prevState.exit) {
        prevState.exit();
    }
    this.state = nextState;
    if (nextState.enter) {
        nextState.enter();
    }
};

/**
 * Represents a platform the game will run on.
 * @type {Object}
 */
Engin.Platform = {
    WEB: "Web",
    WEBWORKS: "Webworks"
};

//////////////////
// ASSETS
//////////////////
Engin.Assets = {};

/**
 * Manages assets.
 */
Engin.Assets.AssetManager = function(game, _images, _sounds) {
    this.game = game;
    this._images = _images;
    this._sounds = _sounds;
    this.images = {};
    this.sounds = {};
};

Engin.Assets.AssetManager.prototype.load = function() {
    for (var i = 0; i < this._images.length; i++) {
        var name = this._images[i];
        this.images[name] = (function() {
            var img = new Image();
            img.src = "./assets/images/" + name + ".png";
            return img;
        })()
    }

    for (var i = 0; i < this._sounds.length; i++) {
        var name = this._sounds[i];
        var that = this;
        this.sounds[name] = (function() {
            return new Engin.Assets.Sound[that.game.platform](name);
        })()
    }
};

Engin.Assets.Sound = {};

Engin.Assets.Sound.Web = function(name) {
    this.name = name;
    this.sound = document.createElement('audio');
    this.sound.setAttribute("src", "./assets/sounds/" + name + ".mp3");
    this.sound.load();
}

Engin.Assets.Sound.Web.prototype.play = function() {
    this.sound.play();
}

Engin.Assets.Sound.Web.prototype.reset = function() {
    var sound = this.sound;
    sound.addEventListener('ended', function() {
        sound.currentTime = 0;
    });
}

Engin.Assets.Sound.Web.prototype.startLooping = function() {
    if (this.looping) {
        return;
    }
    this.looping = true;

    var sound = this.sound;
    sound.addEventListener('ended', function() {
        sound.currentTime = 0;
        sound.play();
    }, false);
}

Engin.Assets.Sound.Web.prototype.pause = function() {
    this.sound.pause();
}

Engin.Assets.Sound.Web.prototype.stop = function() {
    this.sound.stop();
}

Engin.Assets.Sound.Webworks = Engin.Assets.Sound.Web;

//////////////
// INPUT
//////////////
Engin.Input = {};

Engin.Input.Handler = {};

Engin.Input.Handler.Webworks = function(game) {
    game.canvas.ontouchstart = function ontouchstart(event) {
        var touch = event.touches[0];
        var handlers = game.state.touchHandlers;
        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].call(game.state, {
                    type: 'start',
                    x: touch.screenX,
                    y: touch.screenY
                });
            }
        }
    };

    game.canvas.ontouchend = function ontouchend(event) {
        var touch = event.touches[0];
        var handlers = game.state.touchHandlers;
        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].call(game.state, {
                    type: 'end',
                    x: touch.screenX,
                    y: touch.screenY
                });
            }
        }
    };
};

Engin.Input.Handler.Web = Engin.Input.Handler.Webworks;

/**
 * Checks if a touch is in the rectangular bounds specified by bounds [[x1, y1], [x2, y2]].
 */
Engin.Input.inRectBounds = function inRectBounds(bounds, touch) {
    var minX = Math.min(bounds[0][0], bounds[1][0]);
    var maxX = Math.max(bounds[0][0], bounds[1][0]);

    var minY = Math.min(bounds[0][1], bounds[1][1]);
    var maxY = Math.max(bounds[0][1], bounds[1][1]);

    return (minX <= touch.x && touch.x <= maxX
        && minY <= touch.y && touch.y <= maxY);
};
