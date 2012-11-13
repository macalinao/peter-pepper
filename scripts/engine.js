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
}

/**
 * Initializes the game's resources.
 * @return {[type]} [description]
 */
Engin.Game.prototype.initialize = function initialize(canvas) {
    this.assets.load();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
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

Engin.Assets.Sound.Web.prototype.pause = function() {
    this.sound.pause();
}

Engin.Assets.Sound.Web.prototype.stop = function() {
    this.sound.stop();
}

Engin.Assets.Sound.Webworks = function(name) {
    this.name = name;
    this.player = new blackberry.audio.Player("local:///assets/sounds/" + name + ".mp3");
}

Engin.Assets.Sound.Webworks.prototype.play = function() {
    this.player.play();
}

Engin.Assets.Sound.Webworks.prototype.pause = function() {
    this.player.pause();
}

Engin.Assets.Sound.Webworks.prototype.stop = function() {
    this.player.pause();
    this.player.mediaTime = 0;
}
