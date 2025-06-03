const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path'); // For serving static client files

const apiRoutes = require('./routes/api');
const configureWebsocket = require('./routes/websocket');
// const serverConfig = require('../config/serverConfig'); // If you have specific configs like PORT

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity. For production, restrict this.
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from the 'client/public' directory
// This means CSS, client-side JS, images, etc. will be accessible.
app.use(express.static(path.join(__dirname, '../../client/public')));


// API Routes
app.use('/api', apiRoutes);

// Configure WebSocket event handlers
configureWebsocket(io);

// Basic route for the root path, serving the main game page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/public/index.html'));
});

// Error Handling Middleware (example)
app.use((err, req, res, next) => {
    console.error("Global error handler:", err.stack);
    res.status(500).send('Something broke!');
});

module.exports = { app, server, io }; // Export server and io for server.js
