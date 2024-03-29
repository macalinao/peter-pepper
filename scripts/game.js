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

StateMainMenu.prototype.enter = function enter() {
    this.game.assets.sounds.mariachi.play();
    this.game.assets.sounds.mariachi.startLooping();
};

StateMainMenu.prototype.update = function update(delta) {
    backgroundUpdate(this.game, delta);
};

StateMainMenu.prototype.render = function render() {
    backgroundRender(this.game);
    this.game.ctx.drawImage(this.game.assets.images.logo, 0, 0, this.game.canvas.width, this.game.canvas.height);
};

StateMainMenu.prototype.touchHandlers = [
    function onTouch(touch) {
        if (touch.type == "start") {
            this.game.switchState("ingame");
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

function PepperManager(state) {
    this.state = state;
    this.lastSpawn = Date.now();
    this.peppers = [];

    this.player = this.state.player;

    this.getPepperSpawnX  = function() {
        return Math.random() * this.state.game.canvas.width - 50;
    };

    this.spawnPepper = function(Pepper) {
        this.peppers.push(new Pepper(this.state, this.getPepperSpawnX(), 100));
    };

    this.spawnPeppers = function() {
        var now = Date.now();
        if (now - this.lastSpawn > 1000) {
            if (Math.random() < 0.8) {
                this.spawnPepper(RedPepper);
            } else {
                this.spawnPepper(GreenPepper);
            }
            this.lastSpawn = now;
        }
    };

    this.update = function(delta) {
        this.spawnPeppers();

        for (var i = 0; i < this.peppers.length; i++) {
            var pepper = this.peppers[i];
            pepper.update(delta);

            // Check for pepper eat
            if (pepper.x > this.player.x && pepper.x < this.player.x + 50 && pepper.y > this.player.y && pepper.y < this.player.y + 150) {
                this.peppers.splice(i, 1);
                pepper.eat();
                this.player.isNowEating();
                continue;
            }

            if (pepper.y > 550) {
                this.peppers.splice(i, i);
            }
        }
    };

    this.draw = function() {
        for (var i = 0; i < this.peppers.length; i++) {
            this.peppers[i].draw();
        }
    };
}

function RedPepper(state, x, speed) {
    this.state = state;
    this.x = x;
    this.y = 0;
    this.speed = speed;

    this.update = function(delta) {
        this.y += this.speed * (delta / 1000);
    };

    this.draw = function() {
        this.state.game.ctx.drawImage(this.state.game.assets.images.redpepper, this.x, this.y);
    };

    this.eat = function() {
        this.state.reds += 1;
        this.state.game.assets.sounds.ah.play();
        this.state.game.assets.sounds.ah.reset();
    };
}

function GreenPepper(state, x, speed) {
    this.state = state;
    this.x = x;
    this.y = 0;
    this.speed = speed;

    this.update = function(delta) {
        this.y += this.speed * (delta / 1000);
    };

    this.draw = function() {
        this.state.game.ctx.drawImage(this.state.game.assets.images.greenpepper, this.x, this.y);
    };

    this.eat = function() {
        this.state.game.globals.score += 1;
        this.state.game.assets.sounds.mm.play();
        this.state.game.assets.sounds.mm.reset();
    };
}

var StateInGame = function StateInGame() {
};

StateInGame.prototype.enter = function enter() {
    this.player = new Player(this);
    this.reds = 0;
    this.pepperManager = new PepperManager(this);
    this.game.globals.score = 0;
};

StateInGame.prototype.update = function update(delta) {
    backgroundUpdate(this.game, delta);
    this.player.update(delta);
    this.pepperManager.update(delta);        

    if (this.reds > 3) {
        this.game.switchState("gameover");
    }
};

StateInGame.prototype.render = function render() {
    backgroundRender(this.game);
    this.player.draw();
    this.pepperManager.draw();

    var ctx = this.game.ctx;

    ctx.font = "40px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("Peppers: " + this.game.globals.score, 20, 40);

    // Draw reds
    for (var i = 0; i < this.reds; i++) {
        ctx.drawImage(this.game.assets.images.redpepper, this.game.canvas.width - 50 - (i * 50), 5);
    }
};

StateInGame.prototype.touchHandlers = [
    function checkLeft(touch) {
        if (touch.type == 'start' && Engin.Input.inRectBounds(
            [
                [0, 0],
                [screen.width / 2, screen.height]
            ], touch)) {
            this.direction = (this.direction == 1) ? 0 : -1;
        }
    },

    function checkRight(touch) {
        if (touch.type == 'start' && Engin.Input.inRectBounds(
            [
                [screen.width / 2, 0],
                [screen.width, screen.height]
            ], touch)) {
            this.direction = (this.direction == -1) ? 0 : 1;        }
    },

    function checkStop(touch) {
        if (touch.type == 'end') {
            this.direction = 0;
        }
    }
];

var StateGameOver = function StateGameOver() {
};

StateGameOver.prototype.render = function render() {
    backgroundRender(this.game);

    var ctx = this.game.ctx;
    ctx.font = "40px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("You managed to eat " + this.game.globals.score + " peppers.", this.game.canvas.width / 2 - 300, this.game.canvas.height / 3);
    ctx.fillText("Click anywhere to try again.", this.game.canvas.width / 2 - 300, this.game.canvas.height / 2)
};

StateGameOver.prototype.touchHandlers = [
    function backToMainMenu(touch) {
        if (touch.type == 'start') {
            this.game.switchState('initial');
        }
    }
];

// Temp workaround for Ripple
var hasReadied = false;

document.addEventListener("webworksready", function() {
// $(function() {
    if (hasReadied) {
        return;
    }
    hasReadied = true;
    
    var game = new Engin.Game({
        platform: Engin.Platform.WEBWORKS,
        assets: {
            images: ["bg", "clouds", "greenpepper", "mexican", "mexicaneating", "redpepper", "logo"],
            sounds: ["mariachi", "mm", "ah"]
        }
    });

    var canvas = document.getElementById("game");
    canvas.width = document.width;
    canvas.height = document.height;

    game.defineStates({
        initial: StateMainMenu,
        ingame: StateInGame,
        gameover: StateGameOver
    });
    game.globals.clouds = new Clouds(game);
    game.initialize(canvas);

    game.start();
});
