const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
// Optional: const authController = require('../controllers/authController');

// Game Routes
router.post('/game/create', gameController.createGame);          // Create a new game session
router.get('/game/:sessionId', gameController.getGameStatus);     // Get status of a specific game session
router.post('/game/:sessionId/join', gameController.joinGame);    // Player joins a game session
router.post('/game/:sessionId/ready', gameController.playerReady); // Player signals ready
router.post('/game/:sessionId/leave', gameController.leaveGame);  // Player leaves a game session
// Potentially, a route to list active games, though WebSockets might be better for real-time lists

// Example Auth Routes (Optional - if implementing user accounts)
// router.post('/auth/register', authController.register);
// router.post('/auth/login', authController.login);
// router.get('/auth/profile', authController.getProfile); // Protected route

module.exports = router;
