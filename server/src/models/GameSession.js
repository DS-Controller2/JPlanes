const crypto = require('crypto');

class GameSession {
    constructor(sessionId) {
        this.sessionId = sessionId || crypto.randomUUID();
        this.players = new Map(); // Map of playerId to Player object
        this.projectiles = new Map(); // Map of projectileId to Projectile object
        this.gameState = 'waiting'; // 'waiting', 'active', 'paused', 'ended'
        this.gameStartTime = null;
        this.lastUpdateTime = Date.now();
    }

    addPlayer(player) {
        if (!this.players.has(player.id)) {
            this.players.set(player.id, player);
            console.log(`Player ${player.name} (ID: ${player.id}) joined session ${this.sessionId}`);
        }
    }

    removePlayer(playerId) {
        if (this.players.has(playerId)) {
            const player = this.players.get(playerId);
            console.log(`Player ${player.name} (ID: ${playerId}) left session ${this.sessionId}`);
            this.players.delete(playerId);
        }
    }

    getPlayer(playerId) {
        return this.players.get(playerId);
    }

    getAllPlayers() {
        return Array.from(this.players.values());
    }

    addProjectile(projectile) {
        this.projectiles.set(projectile.id, projectile);
    }

    removeProjectile(projectileId) {
        this.projectiles.delete(projectileId);
    }

    getProjectile(projectileId) {
        return this.projectiles.get(projectileId);
    }

    getAllProjectiles() {
        return Array.from(this.projectiles.values());
    }

    updateGameState(newState) {
        this.gameState = newState;
        if (newState === 'active' && !this.gameStartTime) {
            this.gameStartTime = Date.now();
        }
        this.lastUpdateTime = Date.now();
        console.log(`Game session ${this.sessionId} state changed to ${newState}`);
    }

    // Example: Check if all players are ready to start
    areAllPlayersReady() {
        if (this.players.size === 0) return false;
        for (const player of this.players.values()) {
            if (!player.isReady) {
                return false;
            }
        }
        return true;
    }
}

module.exports = GameSession;
