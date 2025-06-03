# Plane Game - Game Design Document (GDD) - Lite

## 1. Overview

*   **Game Title:** Plane Game Online
*   **Genre:** Multiplayer 2D Top-Down/Side-Scrolling Arcade Shooter
*   **Target Audience:** Casual players looking for quick multiplayer action.
*   **Platform:** Web browser (HTML5)
*   **Monetization:** N/A (Project for demonstration)

## 2. Gameplay

### 2.1. Core Mechanics

*   **Movement:** Players control an airplane that can move freely within the game world boundaries (initially up, down, left, right).
*   **Shooting:** Players can fire projectiles from their airplane.
*   **Combat:** Projectiles can hit other players' airplanes, dealing damage.
*   **Health & Lives:** Airplanes have health. When health reaches zero, the airplane is destroyed. (Respawn mechanics or game over conditions to be detailed).
*   **Scoring:** Players earn points for hitting or destroying opponent airplanes.

### 2.2. Game Loop

1.  **Lobby/Waiting:** Players join a game session. They can see other players in the session and signal their readiness.
2.  **Game Start:** Once all (or a minimum number of) players are ready, the game begins.
3.  **Gameplay:** Players fly their planes, shoot at opponents, and try to survive.
4.  **Game End:** The game ends based on certain conditions (e.g., last player standing, time limit, score limit - current implementation ends session if empty).
5.  **Post-Game:** Scores are displayed. Players can choose to play again or return to the main menu.

### 2.3. Player Experience

*   Fast-paced and engaging.
*   Easy to learn controls.
*   Satisfaction from successful hits and evasive maneuvers.

## 3. Game Elements

### 3.1. Player Airplane

*   **Attributes:**
    *   Health: Determines how much damage it can sustain.
    *   Speed: How fast it moves.
    *   Fire Rate: How quickly it can shoot (not fully implemented yet).
    *   Projectile Type: The type of projectile it fires.
*   **Controls:** Keyboard (WASD or Arrow keys for movement, Spacebar to shoot).
*   **Visuals:** Basic 2D sprite. Placeholder is a blue square. Player name displayed above.

### 3.2. Projectiles

*   **Attributes:**
    *   Damage: Amount of health it removes on impact.
    *   Speed: How fast it travels.
    *   Type: (e.g., bullet, missile - currently one 'bullet' type).
*   **Behavior:** Fired in a straight line from the airplane. Deactivated on impact or when out of bounds.
*   **Visuals:** Basic 2D sprite. Placeholder is a yellow rectangle.

### 3.3. Game World

*   **Environment:** A 2D area (defined by `GAME_WORLD_WIDTH`, `GAME_WORLD_HEIGHT` in `gameLogic.js`).
*   **Boundaries:** Airplanes cannot move outside these boundaries. Projectiles are deactivated if they go out of bounds.
*   **Background:** Simple tiled background (placeholder is a light gray color).
*   **Camera:** Follows the local player's airplane.

### 3.4. Enemies (Future - for PvE or mixed modes)

*   N/A in current core implementation.
*   Could include AI-controlled planes with varying behaviors and attack patterns.

### 3.5. Power-ups (Future)

*   N/A in current core implementation.
*   Examples: Speed boost, shield, rapid fire, special weapon.

## 4. User Interface (UI)

*   **Main Menu:** Input for player name, session ID. Button to join/create game.
*   **Waiting Screen:** Displays session ID, list of players and their ready status. Button to toggle ready state.
*   **In-Game HUD (Heads-Up Display):**
    *   Score
    *   Health
    *   FPS (Frames Per Second)
*   **Game Over Screen:** Displays final score. Button to play again.

## 5. Technical Details

*   **Backend:** Node.js, Express.js, Socket.IO
*   **Frontend:** HTML5 Canvas, JavaScript (vanilla)
*   **Physics:** Basic server-side physics for movement and collision.
*   **Networking:** Real-time updates via WebSockets (Socket.IO). Server-authoritative logic.

## 6. Future Development Ideas

*   Different airplane types with unique stats and abilities.
*   Variety of projectile types.
*   AI enemies for PvE or mixed modes.
*   Power-ups and collectibles.
*   More detailed maps or scrolling levels.
*   Improved graphics and sound effects.
*   Persistent player accounts and high scores (optional authController and db integration).
*   Different game modes (e.g., team deathmatch, capture the flag).
