// Server Configuration
require('dotenv').config(); // Load environment variables from .env file

const serverConfig = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0', // Listen on all available network interfaces
    // jwtSecret: process.env.JWT_SECRET || 'your_default_secret_key_here', // For auth
    // Other server-wide configurations
};

module.exports = serverConfig;
