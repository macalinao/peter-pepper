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

    game.initialize(canvas);

    game.ctx.drawImage(game.assets.images.bg, 0, 0, canvas.width, canvas.height);

    game.assets.sounds.mariachi.play();
});
