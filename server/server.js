// Main server startup script
const { server } = require('./src/app'); // Get the http server instance from app.js
const serverConfig = require('./config/serverConfig');

const PORT = serverConfig.port;
const HOST = serverConfig.host;

server.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
    console.log(`Game client should be accessible at http://localhost:${PORT} (if host is 0.0.0.0 or localhost)`);
});

// Optional: Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Perform any other cleanup here (e.g., database connections)
        process.exit(0);
    });
});
