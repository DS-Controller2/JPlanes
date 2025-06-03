// Basic Physics Engine

const physicsEngine = {
    updatePosition(entity, deltaTime) {
        // deltaTime is in seconds
        if (!entity || !entity.velocity || !entity.position) {
            return;
        }

        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;
    },

    // More complex physics like acceleration, friction, etc., could be added here
    // For simplicity, we'll stick to basic velocity-based movement.
};

module.exports = physicsEngine;
