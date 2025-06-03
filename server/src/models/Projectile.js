class Projectile {
    constructor(id, ownerId, type, damage, speed, position, velocity) {
        this.id = id; // Unique ID for the projectile
        this.ownerId = ownerId; // ID of the player who fired it
        this.type = type; // e.g., 'bullet', 'missile'
        this.damage = damage;
        this.speed = speed;
        this.position = position; // { x, y }
        this.velocity = velocity; // { x, y } for direction and speed
        this.isActive = true; // Becomes false on impact or out of bounds
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    deactivate() {
        this.isActive = false;
    }
}

module.exports = Projectile;
