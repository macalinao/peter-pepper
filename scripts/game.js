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

StateMainMenu.prototype.update = function update(delta) {
};

StateMainMenu.prototype.render = function render() {
    var x = this.game.ctx;

    x.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    x.drawImage(this.game.assets.images.bg, 0, 0);
};

/**
 * In-game state
 */
var StateInGame = function StateInGame() {

};

document.addEventListener("webworksready", function() {
    var game = new Engin.Game({
        platform: Engin.Platform.WEB,
        assets: {
            images: ["bg"],
            sounds: ["mariachi"]
        }
    });

    var canvas = document.getElementById("game");
    canvas.width = document.width;
    canvas.height = document.height;

    game.defineStates({
        initial: StateMainMenu
    });
    game.initialize(canvas);
    game.start();
});
