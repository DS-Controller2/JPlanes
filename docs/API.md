# Plane Game API Documentation

This document outlines the REST API endpoints and WebSocket events used by the Plane Game.

## REST API

Base URL: `/api` (relative to server root)

### Game Session Management

*   **POST `/game/create`**
    *   Description: Creates a new game session.
    *   Request Body: Optional. `{ "sessionId": "customSessionId" }` (If not provided, server generates one).
    *   Response:
        *   `201 Created`: `{ "sessionId": "generatedOrProvidedSessionId", "message": "Game session created." }`
        *   `500 Internal Server Error`: `{ "message": "Failed to create game session." }`

*   **GET `/game/:sessionId`**
    *   Description: Retrieves the current status and player information for a specific game session.
    *   URL Parameters: `sessionId` (string, required).
    *   Response:
        *   `200 OK`: `{ sessionId, gameState, players: [{id, name, score, isReady, airplane: {type, health, isAlive, position}}], ... }`
        *   `404 Not Found`: `{ "message": "Game session not found." }`

*   **POST `/game/:sessionId/join`** (Primarily for HTTP-based join, WebSocket is preferred for full flow)
    *   Description: Allows a player to join an existing game session.
    *   URL Parameters: `sessionId` (string, required).
    *   Request Body: `{ "playerId": "uniquePlayerId", "playerName": "Player Name" }` (both required).
    *   Response:
        *   `200 OK`: `{ "message": "Player PlayerName joined session.", "playerId": "uniquePlayerId" }`
        *   `400 Bad Request`: If player ID/name missing, or player already in session.
        *   `404 Not Found`: If session not found.

*   **POST `/game/:sessionId/ready`** (Primarily for HTTP-based ready signal)
    *   Description: Allows a player to signal their readiness within a session.
    *   URL Parameters: `sessionId` (string, required).
    *   Request Body: `{ "playerId": "uniquePlayerId" }` (required).
    *   Response:
        *   `200 OK`: `{ "message": "Player PlayerName is ready." }`
        *   `404 Not Found`: If session or player not found.

*   **POST `/game/:sessionId/leave`** (Primarily for HTTP-based leave)
    *   Description: Allows a player to leave a game session.
    *   URL Parameters: `sessionId` (string, required).
    *   Request Body: `{ "playerId": "uniquePlayerId" }` (required).
    *   Response:
        *   `200 OK`: `{ "message": "Player left session." }`
        *   `404 Not Found`: If session not found.

## WebSocket Events

Events are emitted between the client and server after a WebSocket connection is established.

### Client to Server Events

*   **`joinSession`**
    *   Payload: `{ sessionId: "targetSessionId" (can be new), playerName: "Player Name", playerId: "optionalClientPlayerId" }`
    *   Description: Client requests to join or create and join a game session. `playerId` is optional; server might use socket ID if not provided.

*   **`playerInput`**
    *   Payload: `{ sessionId: "currentSessionId", input: { type: "move", direction: {x, y} } }` or `{ type: "shoot" }`
    *   Description: Sends player actions (movement or shooting) to the server.

*   **`playerReady`**
    *   Payload: `{ sessionId: "currentSessionId" }`
    *   Description: Client signals they are ready/not ready to start the game. Server toggles state.

### Server to Client Events

*   **`connect`** (Standard Socket.IO)
    *   Description: Emitted to the client upon successful connection to the WebSocket server.

*   **`disconnect`** (Standard Socket.IO)
    *   Description: Emitted to the client if the connection is lost.

*   **`joinedSession`** (Server to specific client)
    *   Payload: `{ sessionId, playerId, playerData: {name, score, airplane}, gameState, allPlayers: [...] }`
    *   Description: Confirms to the client that they have successfully joined a session. Provides initial game state and player details.

*   **`playerJoined`** (Server to all clients in a session except the new joiner)
    *   Payload: `{ playerId, name, isReady, airplane: {type, position, isAlive} }`
    *   Description: Notifies existing clients that a new player has joined the session.

*   **`playerLeft`** (Server to all remaining clients in a session)
    *   Payload: `{ playerId, name, message }`
    *   Description: Notifies clients that a player has left the session.

*   **`playerReadyStateChanged`** (Server to all clients in a session)
    *   Payload: `{ playerId, isReady }`
    *   Description: Notifies clients about a change in a player's ready status.

*   **`gameStarting`** (Server to all clients in a session)
    *   Payload: `{ message: "All players ready! Game starting..." }`
    *   Description: Signals that the game is about to start.

*   **`gameStateUpdate`** (Server to all clients in a session)
    *   Payload: `{ sessionId, gameState, players: [...], projectiles: [...], lastUpdateTime }` (See `minimalSessionState` in `gameController.js`)
    *   Description: Broadcasts the current state of the game world, including player positions, projectile positions, scores, etc. This is the main real-time update.

*   **`gameOver`** (Server to all clients in a session)
    *   Payload: `{ message: "Game Over!", finalState: { ... } }`
    *   Description: Signals that the game has ended. Provides final game state if applicable.

*   **`error`** (Server to specific client)
    *   Payload: `{ message: "Error description" }`
    *   Description: Sent by the server if an error occurs related to a client's request or action.

*   **`sessionNotFound`** (Server to specific client)
    *   Payload: `{ sessionId }`
    *   Description: Sent if client tries to join a session that doesn't exist (and server isn't set to auto-create).
