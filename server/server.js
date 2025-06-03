// Main server startup script
const { server } = require('./src/app'); // Get the http server instance from app.js
const serverConfig = require('./config/serverConfig');
const localtunnel = require('localtunnel');

const PORT = serverConfig.port;
const HOST = serverConfig.host;

server.listen(PORT, HOST, async () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
    console.log(`Game client should be accessible at http://localhost:${PORT} (if host is 0.0.0.0 or localhost)`);

    try {
        const tunnel = await localtunnel({
            port: PORT,
            // local_host: HOST, // You might need this if HOST is not 'localhost' or '127.0.0.1'
            // subdomain: 'your-desired-subdomain' // Optional: request a specific subdomain
        });
        console.log(`
Localtunnel is active! Public URL: ${tunnel.url}`);
        console.log(`Note: If localtunnel requires a password, it will be displayed above or you'll be prompted.`);
        console.log(`You can share this URL to allow external access to your game server.`);

        tunnel.on('close', () => {
            console.log('Localtunnel connection closed.');
        });
        tunnel.on('error', (err) => {
            console.error('Localtunnel error:', err);
        });
    } catch (err) {
        console.error('Failed to start localtunnel:', err);
    }
});

// Optional: Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    // Note: localtunnel client might not have a direct close method exposed via the tunnel object this way.
    // It typically closes when the underlying process/connection it established terminates.
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
