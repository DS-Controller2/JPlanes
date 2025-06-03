// Client-side player input handling
const PlayerControls = {
    keys: {}, // Stores the state of currently pressed keys
    mouse: { x: 0, y: 0, pressed: false }, // Basic mouse state (if needed)

    init: function() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Example for mouse controls if your game uses them (e.g., aiming)
        // const canvas = document.getElementById('game-canvas');
        // if (canvas) {
        //     canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e, canvas));
        //     canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        //     canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        // }
    },

    handleKeyDown: function(event) {
        this.keys[event.code] = true;
        // Prevent default browser behavior for game keys (e.g., arrow keys scrolling the page)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
            event.preventDefault();
        }
    },

    handleKeyUp: function(event) {
        this.keys[event.code] = false;
    },

    handleMouseMove: function(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
    },

    handleMouseDown: function(event) {
        // event.button === 0 for left click, 1 for middle, 2 for right
        if (event.button === 0) {
            this.mouse.pressed = true;
            // Example: If shooting is mouse-triggered and not continuous key press
            // Network.emitPlayerInput({ type: 'shoot' });
        }
    },

    handleMouseUp: function(event) {
        if (event.button === 0) {
            this.mouse.pressed = false;
        }
    },

    // Called in the game loop to process current input states
    processInput: function() {
        if (!Game.isPlaying()) return; // Only process input if game is active

        let direction = { x: 0, y: 0 };
        let hasMoved = false;

        // Keyboard movement (WASD or Arrow Keys)
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            direction.y = -1; // Assuming Y decreases upwards
            hasMoved = true;
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            direction.y = 1; // Assuming Y increases downwards
            hasMoved = true;
        }
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            direction.x = -1;
            hasMoved = true;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            direction.x = 1;
            hasMoved = true;
        }

        if (hasMoved) {
            // Normalize diagonal movement if necessary, or let server handle speed cap
            // For simplicity, sending raw direction. Server uses airplane's speed.
            Network.emitPlayerInput({ type: 'move', direction: direction });
        } else {
            // Optional: Send a 'stop' movement if no direction keys are pressed,
            // if your server requires explicit stop commands.
            // Otherwise, server might just continue last velocity or stop if no new 'move' comes.
            // For this example, we'll assume server stops if no 'move' input.
            // To make it explicit, you could send:
            // Network.emitPlayerInput({ type: 'move', direction: {x:0, y:0} });
            // However, this might be chatty. Server-side logic can handle no input as stop.
        }

        // Shooting (Space bar)
        // This could be a one-shot or continuous. For simplicity, one-shot per press.
        // For continuous, you'd need to manage a fire rate timer.
        if (this.keys['Space']) {
            Network.emitPlayerInput({ type: 'shoot' });
            this.keys['Space'] = false; // Prevent continuous shooting from one key press without timer
        }
    }
};
