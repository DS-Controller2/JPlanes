class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.airplane = null; // Will be assigned an Airplane object
        this.score = 0;
        this.isReady = false;
    }

    assignAirplane(airplane) {
        this.airplane = airplane;
    }

    updateScore(points) {
        this.score += points;
    }

    resetScore() {
        this.score = 0;
    }
}

module.exports = Player;
