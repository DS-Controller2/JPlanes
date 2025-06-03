# Plane Game Online

A multiplayer 2D plane shooter game built with Node.js, Express, Socket.IO, and HTML5 Canvas.

## Features (Implemented & Planned)

*   Real-time multiplayer gameplay.
*   Server-authoritative game logic.
*   Player movement and shooting.
*   Basic collision detection.
*   Score tracking.
*   (Planned) Multiple airplane types.
*   (Planned) Power-ups.
*   (Planned) More sophisticated enemy AI for PvE modes.

## Project Structure

The project is divided into two main parts:

*   `server/`: Contains the Node.js backend logic.
    *   `src/`: Main source code (controllers, models, routes, services).
    *   `config/`: Server and game configuration files.
    *   `tests/`: Server-side tests.
*   `client/`: Contains the frontend client code.
    *   `public/`: Static assets (HTML, CSS, JS, images, audio).

Refer to the main project README (if this were a subdirectory) or the file structure provided in the issue for more details.

## Setup and Running

### Prerequisites

*   Node.js (version 16.x or higher recommended)
*   npm (usually comes with Node.js)

### Server Setup

1.  **Navigate to the server directory:**
    \`\`\`bash
    cd server
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Environment Variables:**
    Create a `.env` file in the `server/` directory by copying the example:
    \`\`\`bash
    cp .env.example .env
    \`\`\`
    (Note: The current setup directly creates `.env`. If `.env.example` was standard, this would be the instruction. For now, `.env` is created directly by the tool.)
    Modify `server/.env` if necessary (e.g., for `PORT`).

4.  **Start the server:**
    \`\`\`bash
    npm st​art
    \`\`\`
    The server will start, typically on `http://localhost:3000`.

### Localtunnel Integration

The server is configured to use `localtunnel` to expose your local server to the internet for easier multiplayer testing. When you run `npm st​art`, you should see a message in the console like:

\`\`\`
Localtunnel is active! Public URL: https://your-generated-subdomain.loca.lt
\`\`\`

You can share this public URL with others to connect to your game server.

### Client Usage

1.  Ensure the server is running.
2.  Open a web browser and navigate to the server's address (e.g., `http://localhost:3000` if running locally, or the `localtunnel` URL if accessing remotely).
3.  The game client should load. Enter your name, optionally a session ID (or leave blank to create a new one), and join the game.

## Development

### Server-side
*   **Run in development mode (with nodemon for auto-restarts):**
    \`\`\`bash
    cd server
    npm r​un dev
    \`\`\`
*   **Run tests:**
    \`\`\`bash
    cd server
    npm test
    \`\`\`

### Client-side
The client is currently built with vanilla JavaScript, HTML, and CSS. Files are in `client/public/`. Simply edit these files and refresh your browser to see changes (assuming the server is serving them).

## Contributing

(See CONTRIBUTING.md - this file is currently a placeholder)
This project is primarily a demonstration. For significant contributions, please discuss with the maintainers.
1. Fork the repository.
2. Create a new branch (\`git checkout -b feature/AmazingFeature\`).
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`).
4. Push to the branch (\`git push origin feature/AmazingFeature\`).
5. Open a Pull Request.

## License

(See LICENSE - this file is currently a placeholder)
Distributed under the MIT License. See \`LICENSE\` for more information.
