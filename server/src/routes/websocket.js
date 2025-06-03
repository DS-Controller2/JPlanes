const gameController = require('../controllers/gameController');
const gameLogic = require('../services/gameLogic'); // May need for direct session access or player obj creation

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Handle joining a game session via WebSocket
        socket.on('joinSession', (data) => { // data: { sessionId, playerName }
            gameController.handleSocketJoinSession(io, socket, data);
        });

        // Handle player input
        socket.on('playerInput', (data) => { // data: { sessionId, input: { type, ... } }
            gameController.handleSocketPlayerInput(io, socket, data);
        });

        // Handle player ready state
        socket.on('playerReady', (data) => { // data: { sessionId }
            gameController.handleSocketPlayerReady(io, socket, data);
        });

        // Handle client disconnect
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            gameController.handleSocketDisconnect(io, socket);
        });

        // Example: Send initial game list or available sessions (can be part of a lobby system)
        // socket.emit('availableSessions', gameLogic.getAllActiveSessionsInfo());
    });
};
