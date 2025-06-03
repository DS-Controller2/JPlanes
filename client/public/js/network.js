// Client-side network communication
const Network = {
    socket: null,

    connect: function() {
        return new Promise((resolve, reject) => {
            // The server serves socket.io.js, so it's available globally.
            // Ensure this path matches how your server serves the client library.
            // Default is '/socket.io/socket.io.js', so `io()` should just work.
            this.socket = io(); // Defaults to connecting to the host that serves the page.

            this.socket.on('connect', () => {
                console.log('Connected to server with socket ID:', this.socket.id);
                resolve(this.socket.id);
            });

            this.socket.on('connect_error', (err) => {
                console.error('Connection failed:', err);
                reject(err);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Disconnected from server:', reason);
                // Optionally, notify the game or UI about the disconnection
                if (Game && Game.handleDisconnect) {
                    Game.handleDisconnect(reason);
                }
            });

            // Listen for custom game events
            this.setupGameEventListeners();
        });
    },

    setupGameEventListeners: function() {
        if (!this.socket) return;

        this.socket.on('joinedSession', (data) => {
            console.log('Joined session:', data);
            if (Game && Game.handleJoinedSession) {
                Game.handleJoinedSession(data);
            }
            if (UI && UI.showWaitingScreen) {
                UI.showWaitingScreen(data.sessionId, data.allPlayers, data.playerId);
            }
        });

        this.socket.on('playerJoined', (data) => {
            console.log('Another player joined:', data);
            if (UI && UI.addPlayerToWaitingList) {
                UI.addPlayerToWaitingList(data, Game.playerId);
            }
            if (Game && Game.addPlayer) {
                Game.addPlayer(data);
            }
        });

        this.socket.on('playerLeft', (data) => {
            console.log('A player left:', data);
            if (UI && UI.removePlayerFromWaitingList) {
                UI.removePlayerFromWaitingList(data.playerId);
            }
             if (Game && Game.removePlayer) {
                Game.removePlayer(data.playerId);
            }
        });

        this.socket.on('playerReadyStateChanged', (data) => {
            console.log('Player ready state changed:', data);
            if (UI && UI.updatePlayerReadyStatus) {
                UI.updatePlayerReadyStatus(data.playerId, data.isReady);
            }
        });

        this.socket.on('gameStarting', (data) => {
            console.log('Game starting:', data);
            if (UI && UI.showGameScreen) {
                UI.showGameScreen();
            }
            if (Game && Game.handleGameStart) {
                Game.handleGameStart(data);
            }
        });

        this.socket.on('gameStateUpdate', (gameState) => {
            // This will be called frequently, avoid heavy console logging in production
            // console.log('Game state update:', gameState);
            if (Game && Game.handleGameStateUpdate) {
                Game.handleGameStateUpdate(gameState);
            }
        });

        this.socket.on('gameOver', (data) => {
            console.log('Game Over:', data);
            if (UI && UI.showGameOverScreen) {
                UI.showGameOverScreen(Game.state ? Game.state.players.find(p => p.id === Game.playerId)?.score : 0);
            }
            if (Game && Game.handleGameOver) {
                Game.handleGameOver(data);
            }
        });

        this.socket.on('error', (data) => {
            console.error('Server error:', data.message);
            alert(`Server error: ${data.message}`); // Simple error display
        });

        this.socket.on('sessionNotFound', (data) => {
            console.warn('Session not found:', data.sessionId);
            alert(`Session ${data.sessionId} not found. Please check the ID or create a new game.`);
            if(UI && UI.showMenuScreen) UI.showMenuScreen();
        });
    },

    // --- Emitters ---
    emitJoinSession: function(sessionId, playerName, playerId) {
        if (!this.socket) return;
        this.socket.emit('joinSession', { sessionId, playerName, playerId });
    },

    emitPlayerInput: function(input) { // input: { type: 'move', direction: {x,y}} or {type: 'shoot'}
        if (!this.socket || !Game.sessionId) return; // Ensure game context exists
        this.socket.emit('playerInput', { sessionId: Game.sessionId, input });
    },

    emitPlayerReady: function() {
        if (!this.socket || !Game.sessionId) return;
        this.socket.emit('playerReady', { sessionId: Game.sessionId });
    }
};
