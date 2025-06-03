// Client-side asset management
const AssetsLoader = {
    images: {},
    audio: {},
    // levels: {}, // If you have JSON level files

    // Define assets to load
    _imagePaths: {
        'player_plane.png': 'assets/images/player_plane.png',
        'enemy_plane.png': 'assets/images/enemy_plane.png', // Example
        'projectile.png': 'assets/images/projectile.png',
        'background_tile.png': 'assets/images/background_tile.png' // Example
    },
    _audioPaths: {
        'shoot.wav': 'assets/audio/shoot.wav',
        'explosion.wav': 'assets/audio/explosion.wav', // Example
        'engine_loop.mp3': 'assets/audio/engine_loop.mp3' // Example
    },

    loadAssets: function() {
        const promises = [];
        let loadedCount = 0;
        const totalCount = Object.keys(this._imagePaths).length + Object.keys(this._audioPaths).length;

        console.log("Starting asset loading...");

        for (const key in this._imagePaths) {
            const path = this._imagePaths[key];
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.src = path;
                img.onload = () => {
                    this.images[key] = img;
                    loadedCount++;
                    console.log(`Loaded image: ${key} (${loadedCount}/${totalCount})`);
                    resolve(img);
                };
                img.onerror = (err) => {
                    console.error(`Failed to load image: ${key} from ${path}`, err);
                    // Resolve anyway so game can proceed, or reject to halt.
                    // For this example, we'll resolve, game might show placeholders.
                    resolve(null);
                };
            });
            promises.push(promise);
        }

        for (const key in this._audioPaths) {
            const path = this._audioPaths[key];
            const promise = new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.src = path;
                // Browsers often require user interaction to play audio.
                // 'canplaythrough' event means enough data is loaded to play without interruption.
                audio.oncanplaythrough = () => {
                    this.audio[key] = audio;
                    loadedCount++;
                    console.log(`Loaded audio: ${key} (${loadedCount}/${totalCount})`);
                    resolve(audio);
                };
                audio.onerror = (err) => {
                    console.error(`Failed to load audio: ${key} from ${path}`, err);
                    resolve(null); // Resolve so game doesn't hang
                };
                 // Some browsers might not fire 'canplaythrough' if preload is 'none' or for other reasons.
                 // Consider a timeout or just resolving on 'loadedmetadata' for faster (but possibly less reliable) load indication.
            });
            promises.push(promise);
        }

        return Promise.all(promises).then(() => {
            console.log("All assets loading initiated. Check individual logs for success/failure.");
            if (loadedCount === totalCount) {
                console.log("All assets successfully loaded!");
            } else {
                console.warn(`Some assets may not have loaded. Loaded ${loadedCount} of ${totalCount}.`);
            }
            return { images: this.images, audio: this.audio };
        }).catch(error => {
            console.error("An error occurred during asset loading process:", error);
            return { images: this.images, audio: this.audio }; // Return what's loaded
        });
    },

    getImage: function(key) {
        return this.images[key];
    },

    getAudio: function(key) {
        return this.audio[key];
    }
};
