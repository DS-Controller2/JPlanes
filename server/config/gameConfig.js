// Game Specific Configurations (Server-Side)

const gameConfig = {
    gameTickRate: 30, // Target updates per second for the game loop
    world: {
        width: 1920,
        height: 1080,
    },
    player: {
        defaultSpeed: 200, // Default speed for airplanes (units per second)
        defaultHealth: 100,
        respawnTime: 5000, // milliseconds
    },
    projectile: {
        defaultSpeed: 500, // Default speed for projectiles (units per second)
        defaultDamage: 10,
        maxLifetime: 4000, // milliseconds before a projectile self-destructs if no collision
    },
    // Define different airplane types, enemy types, power-ups, etc.
    airplaneTypes: {
        'defaultFighter': {
            speed: 200,
            health: 100,
            fireRate: 5, // projectiles per second
            projectileType: 'bullet_basic',
        },
        'bomber': {
            speed: 150,
            health: 200,
            fireRate: 1,
            projectileType: 'bomb_basic',
        }
    },
    projectileTypes: {
        'bullet_basic': {
            damage: 10,
            speed: 500,
            // visual: 'bullet_img.png' // Client-side might use this for rendering
        },
        'bomb_basic': {
            damage: 50,
            speed: 200,
            areaOfEffect: 30 // Example custom property
        }
    }
    // Add more game-specific settings as needed
};

module.exports = gameConfig;
