function Clouds(game) {
    this.game = game;
    this.x = 0;
    this.y = 50;
    this.speed = 100;
}

Clouds.prototype.update = function(delta) {
    this.x -= this.speed * (delta / 1000);
    if (this.x < -this.game.canvas.width) {
        this.x = 0;
    }
};

Clouds.prototype.draw = function() {
    this.game.ctx.drawImage(this.game.assets.images.clouds, this.x, this.y, this.game.canvas.width, this.game.canvas.height / 4);
    this.game.ctx.drawImage(this.game.assets.images.clouds, this.x + this.game.canvas.width, this.y, this.game.canvas.width, this.game.canvas.height / 4);
};

function backgroundUpdate(game, delta) {
    game.globals.clouds.update(delta);
}

function backgroundRender(game) {
    game.ctx.drawImage(game.assets.images.bg, 0, 0, game.canvas.width, game.canvas.height);
    game.globals.clouds.draw();
}

/**
 * Main menu state
 */
var StateMainMenu = function StateMainMenu() {
};

StateMainMenu.prototype.initialize = function initialize() {
    this.selected = 0;
};

StateMainMenu.prototype.enter = function enter() {
    this.game.assets.sounds.mariachi.play();
};

StateMainMenu.prototype.exit = function exit() {
};

StateMainMenu.prototype.update = function update(delta) {
    backgroundUpdate(this.game, delta);
};

StateMainMenu.prototype.render = function render() {
    backgroundRender(this.game);
    this.game.ctx.font = "40px Arial";
    this.game.ctx.fillStyle = "#000000";
    this.game.ctx.fillText("Peter Pepper", (this.game.canvas.width / 2) - 100, this.game.canvas.height / 5);

    this.game.ctx.fillText("Start", (this.game.canvas.width / 2) - 100, 3 * this.game.canvas.height / 5);
    this.game.ctx.fillText("Credits", (this.game.canvas.width / 2) - 100, 4 * this.game.canvas.height / 5);
};

StateMainMenu.prototype.touchHandlers = [
    function onTouch(state, touch) {
        if (Engin.Input.inRectBounds(
            [
                [0, 0],
                [100, 100]
            ], touch)) {
            state.game.switchState("ingame");
        }
    }
];

/**
 * In-game state
 */
function Player(state) {
    this.state = state;
    this.x = 50;
    this.y = 3 * state.game.canvas.height / 4;
    this.speed = 300;
    this.reds = 0;

    this.eating = false;
    this.doneTime = 0;

    this.update = function(delta) {
        if (this.state.direction == -1) {
            if (this.x > 0) {
                this.x -= this.speed * (delta / 1000);
            }
        }

        if (this.state.direction == 1) {
            if (this.x < this.state.game.canvas.width - 75) {
                this.x += this.speed * (delta / 1000);
            }
        }

        if (this.eating && this.doneTime < Date.now()) {
            this.eating = false;
        }
    };

    this.draw = function() {
        var game = this.state.game;

        if (this.eating) {
            game.ctx.drawImage(game.assets.images.mexicaneating, this.x, this.y);
        } else {
            game.ctx.drawImage(game.assets.images.mexican, this.x, this.y);
        }
    };

    this.isNowEating = function() {
        this.eating = true;
        this.doneTime = Date.now() + 200;
    };
}

var StateInGame = function StateInGame() {
};

StateInGame.prototype.initialize = function initialize() {
    this.selected = 0;
};

StateInGame.prototype.enter = function enter() {
    this.player = new Player(this);
};

StateInGame.prototype.exit = function exit() {
};

StateInGame.prototype.update = function update(delta) {
    backgroundUpdate(this.game, delta);
    this.player.update(delta);
};

StateInGame.prototype.render = function render() {
    backgroundRender(this.game);
    this.player.draw();
};

StateInGame.prototype.touchHandlers = [
    function checkLeft(state, touch) {
        if (touch.type == 'start' && Engin.Input.inRectBounds(
            [
                [0, 0],
                [screen.width / 2, screen.height]
            ], touch)) {
            state.direction = (state.direction == 1) ? 0 : -1;
        }
    },

    function checkRight(state, touch) {
        if (touch.type == 'start' && Engin.Input.inRectBounds(
            [
                [screen.width / 2, 0],
                [screen.width, screen.height]
            ], touch)) {
            state.direction = (state.direction == -1) ? 0 : 1;        }
    },

    function checkStop(state, touch) {
        if (touch.type == 'end') {
            state.direction = 0;
        }
    }
];

document.addEventListener("webworksready", function() {
// $(function() {
    var game = new Engin.Game({
        platform: Engin.Platform.WEB,
        assets: {
            images: ["bg", "clouds", "greenpepper", "mexican", "mexicaneating", "redpepper"],
            sounds: ["mariachi"]
        }
    });
    window.game = game

    var canvas = document.getElementById("game");
    canvas.width = document.width;
    canvas.height = document.height;

    game.defineStates({
        initial: StateMainMenu,
        ingame: StateInGame
    });
    game.globals.clouds = new Clouds(game);
    game.initialize(canvas);

    game.start();
});
