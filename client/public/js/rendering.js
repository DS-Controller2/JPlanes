// Client-side game rendering logic
const Rendering = {
    canvas: null,
    ctx: null,
    assets: null, // Will be populated by AssetsLoader

    // Camera/viewport (simple version, just an offset)
    camera: {
        x: 0,
        y: 0,
        width: 800, // Match canvas width
        height: 600 // Match canvas height
    },

    init: function(canvasElement, assets) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.assets = assets;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;

        if (!this.ctx) {
            console.error("Failed to get 2D rendering context from canvas.");
            return false;
        }
        return true;
    },

    clearCanvas: function() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Optional: Draw a background if not using a static CSS background for the canvas
        const bgImage = this.assets ? this.assets.images['background_tile.png'] : null;
        if (bgImage && bgImage.complete) { // Ensure image is loaded
            // Example: Tiled background
            const pattern = this.ctx.createPattern(bgImage, 'repeat');
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback solid color background
            this.ctx.fillStyle = '#87CEEB'; // Sky blue
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    // Update camera to follow the player (or other entity)
    updateCamera: function(playerWorldX, playerWorldY) {
        // Simple camera: centers player, but keeps camera within world bounds (if known)
        // For this example, we'll just center the player on screen.
        // A more complex camera would have smoothing, dead zones, and world boundaries.

        // Target camera position to center the player
        let targetCamX = playerWorldX - this.camera.width / 2;
        let targetCamY = playerWorldY - this.camera.height / 2;

        // TODO: Add clamping to world boundaries if GAME_WORLD_WIDTH/HEIGHT are known here
        // For now, camera can go anywhere.

        this.camera.x = targetCamX;
        this.camera.y = targetCamY;
    },

    render: function(gameState, localPlayerId) {
        if (!this.ctx || !gameState) return;
        this.clearCanvas();

        const localPlayer = gameState.players.find(p => p.id === localPlayerId);
        if (localPlayer && localPlayer.airplane && localPlayer.airplane.isAlive) {
             // Update camera to follow the local player's airplane
            this.updateCamera(localPlayer.airplane.position.x, localPlayer.airplane.position.y);
        } else {
            // If no local player or player is dead, camera could be static or follow something else
            // For now, keep last position or reset
            // this.camera.x = 0; this.camera.y = 0; // Or some default view
        }

        // Render players (airplanes)
        gameState.players.forEach(player => {
            if (player.airplane && player.airplane.isAlive) {
                this.drawAirplane(player.airplane);
            }
        });

        // Render projectiles
        gameState.projectiles.forEach(projectile => {
            if (projectile.isActive) { // isActive might not be a property, check position or server filters
                this.drawProjectile(projectile);
            }
        });

        // Optional: Render game world boundaries or other static elements
        // this.drawWorldBoundaries(gameState.worldWidth, gameState.worldHeight);

        // Optional: Render debug info
        // this.drawDebugInfo(gameState);
    },

    drawAirplane: function(airplane) {
        if (!this.ctx || !this.assets) return;
        const planeImage = this.assets.images['player_plane.png']; // Assuming one image for all now

        // Convert world coordinates to screen (camera) coordinates
        const screenX = airplane.position.x - this.camera.x;
        const screenY = airplane.position.y - this.camera.y;

        // Basic culling: don't draw if far off-screen
        // These dimensions should match the image or be part of airplane data
        const planeWidth = 50;
        const planeHeight = 50;
        if (screenX < -planeWidth || screenX > this.camera.width ||
            screenY < -planeHeight || screenY > this.camera.height) {
            return;
        }

        if (planeImage && planeImage.complete) {
            this.ctx.save();
            // TODO: Add rotation if airplane.angle is provided
            // this.ctx.translate(screenX + planeWidth / 2, screenY + planeHeight / 2);
            // this.ctx.rotate(airplane.angle * Math.PI / 180); // Assuming angle in degrees
            // this.ctx.drawImage(planeImage, -planeWidth / 2, -planeHeight / 2, planeWidth, planeHeight);
            this.ctx.drawImage(planeImage, screenX, screenY, planeWidth, planeHeight);
            this.ctx.restore();

            // Draw health bar above/below plane
            this.drawHealthBar(screenX, screenY - 10, planeWidth, 5, airplane.health, airplane.maxHealth || 100);

        } else {
            // Fallback drawing if image not loaded
            this.ctx.fillStyle = 'blue';
            this.ctx.fillRect(screenX, screenY, planeWidth, planeHeight);
        }

        // Draw player name (optional)
        this.ctx.fillStyle = 'black';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        //this.ctx.fillText(Game.state.players.find(p => p.airplane === airplane)?.name || '', screenX + planeWidth / 2, screenY - 15);

    },

    drawProjectile: function(projectile) {
        if (!this.ctx || !this.assets) return;
        const projectileImage = this.assets.images['projectile.png'];

        const screenX = projectile.position.x - this.camera.x;
        const screenY = projectile.position.y - this.camera.y;

        const projWidth = 10;
        const projHeight = 20;
        if (screenX < -projWidth || screenX > this.camera.width ||
            screenY < -projHeight || screenY > this.camera.height) {
            return;
        }

        if (projectileImage && projectileImage.complete) {
            this.ctx.drawImage(projectileImage, screenX, screenY, projWidth, projHeight);
        } else {
            this.ctx.fillStyle = 'yellow';
            this.ctx.fillRect(screenX, screenY, projWidth, projHeight);
        }
    },

    drawHealthBar: function(x, y, width, height, currentHealth, maxHealth) {
        if (!this.ctx) return;
        // Background of health bar (empty part)
        this.ctx.fillStyle = '#FF0000'; // Red for empty
        this.ctx.fillRect(x, y, width, height);

        // Foreground of health bar (current health)
        const healthPercentage = Math.max(0, currentHealth) / maxHealth;
        this.ctx.fillStyle = '#00FF00'; // Green for health
        this.ctx.fillRect(x, y, width * healthPercentage, height);

        // Border (optional)
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
    }

    // TODO: Methods for drawing explosions, power-ups, background elements, etc.
};
