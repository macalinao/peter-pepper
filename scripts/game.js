$(function() {

    var assets = new AssetManager(["bg"], []);
    assets.load();

    var canvas = document.getElementById("game");
    canvas.width = document.width
    canvas.height = document.height
    
    var ctx = canvas.getContext("2d");
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(10, 10, 100, 100);

    ctx.drawImage(assets.images.bg, 0, 0, canvas.width, canvas.height)
});
