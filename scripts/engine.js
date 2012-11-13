function AssetManager(_images, _sounds) {
    this.images = {}
    this.sounds = {}

    this.load = function() {
        for (var i = 0; i < _images.length; i++) {
            var name = _images[i]
            this.images[name] = (function() {
                var img = new Image();
                img.src = "./assets/images/" + name + ".png"
                return img
            })()
        }

        for (var i = 0; i < _sounds.length; i++) {
            var name = _sounds[i]
            this.sounds[name] = (function() {
                var sound = document.createElement('audio')
                sound.setAttribute("src", "./assets/sounds/" + name + ".mp3")
                sound.load()
                return sound
            })()
        }
    }
}
