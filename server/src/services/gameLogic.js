const physicsEngine = require('./physicsEngine');
const Projectile = require('../models/Projectile');
const crypto = require('crypto');

// Game Boundaries (example, should be configurable)
const GAME_WORLD_WIDTH = 1920;
const GAME_WORLD_HEIGHT = 1080;

const gameLogic = {
    gameSessions: new Map(), // Stores active game sessions: sessionId -> GameSession object

    createGameSession(sessionId) {
        const GameSession = require('../models/GameSession'); // Late require to avoid circular deps if any
        if (this.gameSessions.has(sessionId)) {
            return this.gameSessions.get(sessionId);
        }
        const newSession = new GameSession(sessionId);
        this.gameSessions.set(newSession.sessionId, newSession);
        console.log(`Game session created: ${newSession.sessionId}`);
        return newSession;
    },

    getGameSession(sessionId) {
        return this.gameSessions.get(sessionId);
    },

    removeGameSession(sessionId) {
        if (this.gameSessions.has(sessionId)) {
            this.gameSessions.delete(sessionId);
            console.log(`Game session removed: ${sessionId}`);
        }
    },

    updateGameWorld(sessionId) {
        const session = this.getGameSession(sessionId);
        if (!session || session.gameState !== 'active') {
            return null; // Or some other indicator that no update happened
        }

        const now = Date.now();
        const deltaTime = (now - session.lastUpdateTime) / 1000; // Convert ms to seconds

        // Update player airplane positions
        session.players.forEach(player => {
            if (player.airplane && player.airplane.isAlive) {
                physicsEngine.updatePosition(player.airplane, deltaTime);
                // Basic boundary check for airplanes
                this.checkAirplaneBoundaries(player.airplane);
            }
        });

        // Update projectile positions and check for collisions or out of bounds
        const projectilesToRemove = [];
        session.projectiles.forEach(projectile => {
            if (projectile.isActive) {
                physicsEngine.updatePosition(projectile, deltaTime);

                // Check for out of bounds
                if (this.isOutOfBounds(projectile.position)) {
                    projectile.deactivate();
                    projectilesToRemove.push(projectile.id);
                    return; // No need to check collision if out of bounds
                }

                // Check for collisions with airplanes
                session.players.forEach(player => {
                    if (player.airplane && player.airplane.isAlive && projectile.ownerId !== player.id) {
                        if (this.checkCollision(projectile, player.airplane)) {
                            player.airplane.takeDamage(projectile.damage);
                            // Potentially update score for the projectile owner
                            const owner = session.getPlayer(projectile.ownerId);
                            if (owner) {
                                owner.updateScore(10); // Example: 10 points for a hit
                            }
                            projectile.deactivate();
                            projectilesToRemove.push(projectile.id);

                            if (!player.airplane.isAlive) {
                                console.log(`Player ${player.name}'s airplane destroyed.`);
                                // Handle player "death" - e.g., respawn timer, game over for player, etc.
                            }
                        }
                    }
                });
            } else {
                 projectilesToRemove.push(projectile.id);
            }
        });

        projectilesToRemove.forEach(id => session.removeProjectile(id));

        session.lastUpdateTime = now;
        return session; // Return the updated session state
    },

    handlePlayerInput(sessionId, playerId, input) {
        const session = this.getGameSession(sessionId);
        if (!session || !session.getPlayer(playerId) || !session.getPlayer(playerId).airplane) {
            return;
        }
        const player = session.getPlayer(playerId);
        const airplane = player.airplane;

        // Example input: { type: 'move', direction: { x, y } } or { type: 'shoot' }
        if (input.type === 'move' && airplane.isAlive) {
            // Normalize direction vector if necessary, then scale by speed
            const dirX = input.direction.x || 0;
            const dirY = input.direction.y || 0;
            // Simple direct velocity set, could be more complex (e.g., acceleration)
            airplane.setVelocity(dirX * airplane.speed, dirY * airplane.speed);
        } else if (input.type === 'shoot' && airplane.isAlive) {
            this.fireProjectile(session, playerId);
        }
    },

    fireProjectile(session, playerId) {
        const player = session.getPlayer(playerId);
        if (!player || !player.airplane || !player.airplane.isAlive) return;

        const airplane = player.airplane;
        const projectileId = crypto.randomUUID();
        // Assuming projectile starts at the airplane's nose, and fires forward (e.g. positive Y)
        // Adjust type, damage, speed, and initial velocity direction as per game design
        const initialPosition = { ...airplane.position };
        // Example: Fire upwards. Adjust based on plane orientation in your game.
        const initialVelocity = { x: 0, y: -500 }; // Speed of 500 units/sec upwards

        const newProjectile = new Projectile(
            projectileId,
            playerId,
            'bullet', // type
            10,       // damage
            500,      // speed magnitude (used by physics if velocity isn't directly set)
            initialPosition,
            initialVelocity
        );
        session.addProjectile(newProjectile);
        console.log(`Player ${player.name} fired projectile ${projectileId}`);
    },

    checkCollision(entityA, entityB) {
        // Simple AABB (Axis-Aligned Bounding Box) collision detection
        // Assumes entities have { position: {x, y}, width: w, height: h }
        // For simplicity, using placeholder dimensions. These should be part of Airplane/Projectile models.
        const entityAWidth = entityA.width || 30; // Placeholder
        const entityAHeight = entityA.height || 30; // Placeholder
        const entityBWidth = entityB.width || 50; // Placeholder for airplane
        const entityBHeight = entityB.height || 50; // Placeholder for airplane

        return (
            entityA.position.x < entityB.position.x + entityBWidth &&
            entityA.position.x + entityAWidth > entityB.position.x &&
            entityA.position.y < entityB.position.y + entityBHeight &&
            entityA.position.y + entityAHeight > entityB.position.y
        );
    },

    isOutOfBounds(position) {
        // Check if a projectile is outside the game world boundaries
        return (
            position.x < 0 ||
            position.x > GAME_WORLD_WIDTH ||
            position.y < 0 ||
            position.y > GAME_WORLD_HEIGHT
        );
    },

    checkAirplaneBoundaries(airplane) {
        // Prevent airplane from going out of bounds
        const airplaneWidth = airplane.width || 50; // Placeholder
        const airplaneHeight = airplane.height || 50; // Placeholder

        if (airplane.position.x < 0) airplane.position.x = 0;
        if (airplane.position.x > GAME_WORLD_WIDTH - airplaneWidth) {
            airplane.position.x = GAME_WORLD_WIDTH - airplaneWidth;
        }
        if (airplane.position.y < 0) airplane.position.y = 0;
        if (airplane.position.y > GAME_WORLD_HEIGHT - airplaneHeight) {
            airplane.position.y = GAME_WORLD_HEIGHT - airplaneHeight;
        }
    },

    // Could add more methods: e.g., spawnEnemy, handlePowerUp, etc.
};

module.exports = gameLogic;
