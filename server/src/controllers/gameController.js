const gameLogic = require('../services/gameLogic');
const Player = require('../models/Player');
const Airplane = require('../models/Airplane'); // For creating airplanes for players

// Store socketId to playerId and sessionId mapping for easy lookup on disconnect
const socketPlayerMap = new Map(); // socket.id -> { playerId, sessionId }

const gameController = {
    // --- REST API Handlers ---

    createGame: (req, res) => {
        // sessionId could be provided by client or generated here
        const sessionId = req.body.sessionId || require('crypto').randomUUID();
        const session = gameLogic.createGameSession(sessionId);
        if (session) {
            res.status(201).json({ sessionId: session.sessionId, message: 'Game session created.' });
        } else {
            res.status(500).json({ message: 'Failed to create game session.' });
        }
    },

    getGameStatus: (req, res) => {
        const sessionId = req.params.sessionId;
        const session = gameLogic.getGameSession(sessionId);
        if (session) {
            // Return a snapshot of the game state (players, scores, game state)
            // Avoid sending overly large objects or internal server details.
            const playersInfo = session.getAllPlayers().map(p => ({
                id: p.id, name: p.name, score: p.score, isReady: p.isReady,
                airplane: p.airplane ? { type: p.airplane.type, health: p.airplane.health, isAlive: p.airplane.isAlive, position: p.airplane.position } : null
            }));
            res.status(200).json({
                sessionId: session.sessionId,
                gameState: session.gameState,
                players: playersInfo,
                // projectileCount: session.projectiles.size // Example additional info
            });
        } else {
            res.status(404).json({ message: 'Game session not found.' });
        }
    },

    joinGame: (req, res) => { // Primarily for HTTP, WebSocket join is separate
        const { sessionId } = req.params;
        const { playerId, playerName } = req.body; // Client should generate a unique playerId or server can

        if (!playerId || !playerName) {
            return res.status(400).json({ message: 'Player ID and name are required.' });
        }

        const session = gameLogic.getGameSession(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Game session not found.' });
        }

        if (session.getPlayer(playerId)) {
            return res.status(400).json({ message: 'Player already in session.' });
        }

        const player = new Player(playerId, playerName);
        // Assign a default airplane (customize as needed)
        const airplane = new Airplane('defaultFighter', 150, 100); // type, speed, health
        player.assignAirplane(airplane);
        // Set initial position for the airplane (e.g., based on player order or random)
        airplane.setPosition(Math.random() * 500, Math.random() * 500); // Example random start

        session.addPlayer(player);

        res.status(200).json({ message: `Player ${playerName} joined session.`, playerId: player.id });
        // WebSocket broadcast can be triggered here or handled by client making a subsequent socket connection
    },

    playerReady: (req, res) => { // Primarily for HTTP
        const { sessionId } = req.params;
        const { playerId } = req.body;

        const session = gameLogic.getGameSession(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found.' });

        const player = session.getPlayer(playerId);
        if (!player) return res.status(404).json({ message: 'Player not found in session.' });

        player.isReady = true;
        console.log(`Player ${player.name} is ready in session ${sessionId} (HTTP)`);

        // Check if all players are ready to start the game
        if (session.gameState === 'waiting' && session.areAllPlayersReady()) {
            session.updateGameState('active');
            console.log(`Game session ${sessionId} is now active!`);
            // Notify all players via WebSocket (if using a central place for this notification)
            // This might be better handled directly in the socket playerReady handler
        }
        res.status(200).json({ message: `Player ${player.name} is ready.` });
    },

    leaveGame: (req, res) => { // Primarily for HTTP
        const { sessionId } = req.params;
        const { playerId } = req.body;
        const session = gameLogic.getGameSession(sessionId);
        if (session) {
            session.removePlayer(playerId);
            // If player was last one, perhaps end/archive session
            if (session.players.size === 0 && session.gameState !== 'ended') {
                 // gameLogic.removeGameSession(sessionId); // or mark as ended
                 session.updateGameState('ended'); // Or remove it
                 console.log(`Session ${sessionId} ended as last player left.`);
            }
            res.status(200).json({ message: 'Player left session.' });
        } else {
            res.status(404).json({ message: 'Game session not found.' });
        }
    },

    // --- WebSocket Event Handlers ---

    handleSocketJoinSession: (io, socket, data) => {
        const { sessionId, playerName } = data;
        let playerId = data.playerId || socket.id; // Use socket.id if playerId not provided by client

        let session = gameLogic.getGameSession(sessionId);
        if (!session) {
            // Option 1: Create session if it doesn't exist (good for "create or join" logic)
            session = gameLogic.createGameSession(sessionId);
            console.log(`Session ${sessionId} did not exist, created by ${playerName} (Socket: ${socket.id})`);
            // Option 2: Reject join if session must be pre-created via API (stricter control)
            // socket.emit('sessionNotFound', { sessionId });
            // return;
        }

        if (session.getPlayer(playerId)) {
            // Handle rejoining or if player ID is already taken (e.g. if client didn't persist its ID)
            // For simplicity, we'll just log and let them effectively "overwrite" if ID matches,
            // or treat as new player if ID is different (like socket.id)
            console.warn(`Player ID ${playerId} attempting to join session ${sessionId} again or ID conflict.`);
            // A robust system might need a way to re-authenticate or manage this.
        }

        socket.join(sessionId); // Join the Socket.IO room for this session
        socketPlayerMap.set(socket.id, { playerId, sessionId });

        const player = new Player(playerId, playerName || `Player_${socket.id.substring(0,5)}`);
        const airplane = new Airplane('defaultFighter', 200, 100); // speed: 200 units/sec
        // Initial position - spread players out or random
        airplane.setPosition(Math.random() * 200 + 50, Math.random() * 200 + 50);
        player.assignAirplane(airplane);
        session.addPlayer(player);

        console.log(`Socket ${socket.id} (Player ${player.name}) joined session room ${sessionId}`);

        // Notify player of successful join and their details
        socket.emit('joinedSession', {
            sessionId: session.sessionId,
            playerId: player.id,
            playerData: {name: player.name, score: player.score, airplane: player.airplane },
            gameState: session.gameState,
            allPlayers: session.getAllPlayers().map(p => ({id: p.id, name: p.name, isReady: p.isReady, airplane: p.airplane ? {type: p.airplane.type, position: p.airplane.position, isAlive: p.airplane.isAlive} : null}))
        });

        // Notify other players in the room about the new player
        socket.to(sessionId).emit('playerJoined', {
            playerId: player.id,
            name: player.name,
            isReady: player.isReady,
            airplane: player.airplane ? {type: p.airplane.type, position: p.airplane.position, isAlive: p.airplane.isAlive} : null
        });
    },

    handleSocketPlayerInput: (io, socket, data) => {
        const { sessionId, input } = data;
        const playerInfo = socketPlayerMap.get(socket.id);

        if (!playerInfo || playerInfo.sessionId !== sessionId) {
            socket.emit('error', { message: "Not authorized or session mismatch for input."});
            return;
        }

        gameLogic.handlePlayerInput(sessionId, playerInfo.playerId, input);
        // Game state update will be broadcasted by the game loop (see below)
    },

    handleSocketPlayerReady: (io, socket, data) => {
        const { sessionId } = data;
        const playerInfo = socketPlayerMap.get(socket.id);

        if (!playerInfo || playerInfo.sessionId !== sessionId) {
            socket.emit('error', { message: "Not authorized or session mismatch for ready signal."});
            return;
        }

        const session = gameLogic.getGameSession(sessionId);
        if (!session) {
            socket.emit('error', { message: "Session not found."});
            return;
        }

        const player = session.getPlayer(playerInfo.playerId);
        if (!player) {
            socket.emit('error', { message: "Player not found in session."});
            return;
        }

        player.isReady = !player.isReady; // Toggle ready state
        console.log(`Player ${player.name} in session ${sessionId} is now ${player.isReady ? 'READY' : 'NOT READY'} (Socket: ${socket.id})`);

        // Notify all players in the session about the change in ready state
        io.to(sessionId).emit('playerReadyStateChanged', { playerId: player.id, isReady: player.isReady });

        // Check if all players are ready to start the game
        if (session.gameState === 'waiting' && session.areAllPlayersReady()) {
            session.updateGameState('active');
            io.to(sessionId).emit('gameStarting', { message: "All players ready! Game starting..." });
            console.log(`Game session ${sessionId} is now active! Starting game loop.`);
            startGameLoop(io, sessionId); // Start the game loop for this session
        } else if (session.gameState === 'active' && !session.areAllPlayersReady()){
            // If a player becomes not ready while game was active (e.g. pause scenario)
            // session.updateGameState('paused');
            // io.to(sessionId).emit('gamePaused', { message: "Game paused as a player is not ready." });
        }
    },

    handleSocketDisconnect: (io, socket) => {
        const playerInfo = socketPlayerMap.get(socket.id);
        if (playerInfo) {
            const { playerId, sessionId } = playerInfo;
            const session = gameLogic.getGameSession(sessionId);
            if (session) {
                const player = session.getPlayer(playerId);
                if (player) {
                     console.log(`Player ${player.name} (Socket: ${socket.id}) disconnected from session ${sessionId}`);
                     session.removePlayer(playerId);
                     io.to(sessionId).emit('playerLeft', { playerId: playerId, name: player.name, message: `${player.name} has left the game.` });
                }

                if (session.players.size === 0 && session.gameState !== 'ended') {
                    console.log(`Session ${sessionId} is now empty and will be ended.`);
                    session.updateGameState('ended');
                    stopGameLoop(sessionId); // Ensure game loop is stopped
                    gameLogic.removeGameSession(sessionId); // Optionally remove it from memory
                }
            }
            socketPlayerMap.delete(socket.id);
        } else {
            console.log(`Socket ${socket.id} disconnected without being mapped to a player/session.`);
        }
    }
};

// --- Game Loop Management ---
const activeGameLoops = new Map(); // sessionId -> intervalId

function startGameLoop(io, sessionId) {
    if (activeGameLoops.has(sessionId)) {
        return; // Loop already running for this session
    }

    const session = gameLogic.getGameSession(sessionId);
    if (!session) return;

    console.log(`Starting game loop for session ${sessionId}`);
    const intervalId = setInterval(() => {
        const updatedSession = gameLogic.updateGameWorld(sessionId);
        if (updatedSession) {
            if (updatedSession.gameState === 'ended' || updatedSession.players.size === 0) {
                console.log(`Session ${sessionId} ended or empty, stopping loop.`);
                io.to(sessionId).emit('gameOver', { message: "Game Over!", finalState: minimalSessionState(updatedSession) });
                stopGameLoop(sessionId);
                gameLogic.removeGameSession(sessionId); // Clean up
                return;
            }
            // Broadcast the relevant parts of the game state to all clients in the session
            io.to(sessionId).emit('gameStateUpdate', minimalSessionState(updatedSession));
        } else {
             // This might happen if session was removed or state is not 'active'
            console.warn(`Game loop for ${sessionId}: updateGameWorld returned null. Session might have ended.`);
            stopGameLoop(sessionId); // Stop loop if session is no longer valid
        }
    }, 1000 / 30); // Target ~30 FPS for updates

    activeGameLoops.set(sessionId, intervalId);
}

function stopGameLoop(sessionId) {
    if (activeGameLoops.has(sessionId)) {
        clearInterval(activeGameLoops.get(sessionId));
        activeGameLoops.delete(sessionId);
        console.log(`Game loop stopped for session ${sessionId}`);
    }
}

// Helper to send only necessary data to clients
function minimalSessionState(session) {
    return {
        sessionId: session.sessionId,
        gameState: session.gameState,
        players: session.getAllPlayers().map(p => ({
            id: p.id,
            name: p.name, // Name might not be needed every frame if static
            score: p.score,
            isReady: p.isReady, // Could be omitted during 'active' state if not changing
            airplane: p.airplane ? {
                type: p.airplane.type, // Static, could be sent once
                position: p.airplane.position,
                velocity: p.airplane.velocity, // Client might predict with this
                health: p.airplane.health,
                isAlive: p.airplane.isAlive,
            } : null
        })),
        projectiles: session.getAllProjectiles().map(p => ({
            id: p.id,
            ownerId: p.ownerId, // For client to know not to collide with self if needed
            type: p.type,
            position: p.position,
            // velocity: p.velocity // If client needs to predict projectile movement
        })),
        lastUpdateTime: session.lastUpdateTime
    };
}


module.exports = gameController;
