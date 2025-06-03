// Main client-side game logic
const Game = {
    canvas: null,
    ctx: null,
    assets: null,
    state: null, // Full game state from server
    playerId: null, // This client's player ID
    sessionId: null,
    lastFrameTime: 0,
    fps: 0,
    frameCount: 0,
    fpsLastUpdateTime: 0,
    _animationFrameId: null, // To store the requestAnimationFrame ID

    init: function() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error("Canvas element not found!");
            return;
        }
        // Set canvas dimensions (can be dynamic or from config)
        this.canvas.width = 800;
        this.canvas.height = 600;

        UI.init(); // Initialize UI elements and listeners
        PlayerControls.init(); // Initialize player input listeners

        // Attempt to load assets first
        AssetsLoader.loadAssets().then(loadedAssets => {
            this.assets = loadedAssets;
            console.log("Assets loaded, proceeding with game initialization.");

            // Initialize Rendering module with the canvas and loaded assets
            if (!Rendering.init(this.canvas, this.assets)) {
                console.error("Rendering engine failed to initialize.");
                return;
            }

            // Don't connect to network immediately, wait for user action via UI.join
            // UI should already be showing the menu screen.
            console.log("Game initialized. Waiting for player to join a session.");

        }).catch(error => {
            console.error("Failed to load assets. Game cannot start.", error);
            // Display an error to the user via UI if possible
        });
    },

    join: function(sessionId, playerName) {
        console.log(`Attempting to join session: ${sessionId} as ${playerName}`);
        this.sessionId = sessionId;
        // Player ID could be assigned by server, or client generates one.
        // For now, let server assign or use socket.id as in gameController.
        // this.playerId = `player_${Math.random().toString(36).substr(2, 9)}`;

        Network.connect().then(socketId => {
            // Using socketId as temporary playerId until server confirms/assigns one
            // Or, server can just use socket.id as the player ID directly
            // this.playerId = socketId;
            Network.emitJoinSession(this.sessionId, playerName, this.playerId);
        }).catch(err => {
            console.error("Failed to connect to network:", err);
            UI.showMenuScreen(); // Revert to menu on connection failure
            alert("Could not connect to the server. Please try again.");
        });
    },

    handleJoinedSession: function(data) {
        console.log("Successfully joined session. Player ID:", data.playerId);
        this.playerId = data.playerId;
        this.sessionId = data.sessionId; // Confirm session ID from server
        this.state = { // Initialize a basic local state
            players: data.allPlayers || [],
            projectiles: [],
            gameState: data.gameState,
            // worldWidth: data.worldWidth, (if server sends this)
            // worldHeight: data.worldHeight,
        };
        // UI.showWaitingScreen was already called by Network.js
        // If Game needs to do more with player list, it can access data.allPlayers
    },

    addPlayer: function(playerData) {
        if (!this.state) return;
        // Avoid duplicates if server sends updates for existing players
        const existingPlayer = this.state.players.find(p => p.id === playerData.id);
        if (!existingPlayer) {
            this.state.players.push(playerData);
        } else {
            // Update existing player data if necessary (e.g. name, ready status)
            Object.assign(existingPlayer, playerData);
        }
    },

    removePlayer: function(removedPlayerId) {
        if (!this.state) return;
        this.state.players = this.state.players.filter(p => p.id !== removedPlayerId);
    },

    handleGameStart: function(data) {
        console.log("Game starting command received from server.");
        if (this.state) {
            this.state.gameState = 'active';
        }
        // UI.showGameScreen() is handled by Network.js listener
        this.lastFrameTime = performance.now();
        this.fpsLastUpdateTime = performance.now();
        this.frameCount = 0;
        this.gameLoop(); // Start the game loop
    },

    handleGameStateUpdate: function(serverState) {
        // Directly replace local state with server state.
        // For more advanced scenarios, you might merge states or interpolate for smoothness.
        this.state = serverState;
    },

    handleGameOver: function(data) {
        console.log("Game over command received.");
        if (this.state) {
            this.state.gameState = 'ended';
        }
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        // UI.showGameOverScreen() is handled by Network.js listener
    },

    handleDisconnect: function(reason) {
        console.warn("Disconnected from server:", reason);
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        // Show an appropriate message and return to menu or a disconnected screen
        alert("Lost connection to the server: " + reason);
        UI.showMenuScreen();
        this.state = null;
        this.playerId = null;
        this.sessionId = null;
    },

    isPlaying: function() {
        return this.state && this.state.gameState === 'active' && this.playerId != null;
    },

    calculateFPS: function(now) {
        this.frameCount++;
        if (now - this.fpsLastUpdateTime > 1000) { // Update FPS display every second
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsLastUpdateTime = now;
        }
    },

    gameLoop: function() {
        if (!this.isPlaying() && !(this.state && this.state.gameState === 'waiting')) { // Allow loop for waiting screen updates if needed
             // Or if game specifically needs to stop rendering/logic when not 'active'
             // For now, let it run if state exists for rendering waiting/game over screens
        }
        if (!this.state) { // If truly no state (e.g. after disconnect)
            console.log("Game loop stopped: No game state.");
            this._animationFrameId = null;
            return;
        }


        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 1000; // Delta time in seconds
        this.lastFrameTime = now;
        this.calculateFPS(now);

        // 1. Process Input (if game is active)
        if (this.isPlaying()) {
            PlayerControls.processInput();
        }

        // 2. Update local state (e.g., client-side predictions - not implemented in this basic version)
        // For this version, we rely entirely on server state updates via 'gameStateUpdate'

        // 3. Render the current game state
        if (Rendering.ctx && this.state) { // Ensure rendering is ready and state exists
            Rendering.render(this.state, this.playerId);
        }

        // 4. Update UI (HUD)
        if (this.state && this.playerId) {
            const currentPlayer = this.state.players.find(p => p.id === this.playerId);
            if (currentPlayer && currentPlayer.airplane) {
                UI.updateHUD(currentPlayer.score, currentPlayer.airplane.health, this.fps);
            } else if (this.state.gameState === 'waiting' || this.state.gameState === 'ended') {
                // Show default HUD or hide elements if player is not active
                UI.updateHUD(currentPlayer?.score || 0, 0, this.fps);
            }
        } else if (this.state && (this.state.gameState === 'waiting' || this.state.gameState === 'ended')) {
            UI.updateHUD(0,0, this.fps); // Show 0 score/health if no specific player data
        }


        // Request the next frame
        this._animationFrameId = requestAnimationFrame(() => this.gameLoop());
    },

    // Call this if game needs to be fully reset to initial menu state
    reset: function() {
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        if (Network.socket) {
            Network.socket.disconnect(); // Cleanly disconnect
        }
        this.state = null;
        this.playerId = null;
        this.sessionId = null;
        UI.showMenuScreen();
        // Potentially re-init parts of UI or clear lists if needed
        console.log("Game has been reset.");
    }
};

// The Game.init() is called from index.html after DOMContentLoaded.
