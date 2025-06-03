class Airplane {
    constructor(type, speed, health) {
        this.type = type;
        this.speed = speed; // Movement speed
        this.health = health; // Current health
        this.maxHealth = health; // Maximum health
        this.isAlive = true;
        this.position = { x: 0, y: 0 }; // Initial position
        this.velocity = { x: 0, y: 0 }; // Current velocity
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
    }

    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    setVelocity(vx, vy) {
        this.velocity.x = vx;
        this.velocity.y = vy;
    }
}

module.exports = Airplane;
