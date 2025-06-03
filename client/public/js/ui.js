// Client-side UI management
const UI = {
    // Screen elements
    menuScreen: null,
    waitingScreen: null,
    hud: null,
    gameOverScreen: null,
    gameCanvas: null,

    // Input elements
    playerNameInput: null,
    sessionIdInput: null,
    joinGameButton: null,
    readyButton: null,
    playAgainButton: null,

    // Display elements
    displaySessionId: null,
    playerList: null,
    scoreDisplay: null,
    healthDisplay: null,
    fpsDisplay: null,
    finalScoreDisplay: null,

    init: function() {
        this.menuScreen = document.getElementById('menu-screen');
        this.waitingScreen = document.getElementById('waiting-screen');
        this.hud = document.getElementById('hud');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameCanvas = document.getElementById('game-canvas');

        this.playerNameInput = document.getElementById('playerNameInput');
        this.sessionIdInput = document.getElementById('sessionIdInput');
        this.joinGameButton = document.getElementById('joinGameButton');
        this.readyButton = document.getElementById('readyButton');
        this.playAgainButton = document.getElementById('playAgainButton');

        this.displaySessionId = document.getElementById('displaySessionId');
        this.playerList = document.getElementById('playerList');
        this.scoreDisplay = document.getElementById('score');
        this.healthDisplay = document.getElementById('health');
        this.fpsDisplay = document.getElementById('fps');
        this.finalScoreDisplay = document.getElementById('finalScore');

        // Event listeners for UI elements
        this.joinGameButton.addEventListener('click', () => {
            const playerName = this.playerNameInput.value.trim();
            let sessionId = this.sessionIdInput.value.trim();
            if (!playerName) {
                alert('Please enter your name.');
                return;
            }
            // If sessionId is empty, server will create one (or client can generate one)
            if (!sessionId) {
                sessionId = `session_${Math.random().toString(36).substr(2, 9)}`; // Basic unique ID
                console.log("No session ID entered, generated one:", sessionId);
            }
            Game.join(sessionId, playerName);
        });

        this.readyButton.addEventListener('click', () => {
            Network.emitPlayerReady();
            // Optimistically update button text, server will confirm state
            this.readyButton.textContent = this.readyButton.textContent === 'Ready' ? 'Not Ready' : 'Ready';
        });

        this.playAgainButton.addEventListener('click', () => {
            this.showMenuScreen();
            // Game.reset() or similar logic might be needed
        });

        this.showMenuScreen(); // Initial screen
    },

    showMenuScreen: function() {
        this.menuScreen.style.display = 'block';
        this.waitingScreen.style.display = 'none';
        this.hud.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.gameCanvas.style.display = 'block'; // Keep canvas visible for background
    },

    showWaitingScreen: function(sessionId, players = [], currentPlayerId = '') {
        this.menuScreen.style.display = 'none';
        this.waitingScreen.style.display = 'block';
        this.hud.style.display = 'none';
        this.gameOverScreen.style.display = 'none';

        this.displaySessionId.textContent = sessionId;
        this.playerList.innerHTML = ''; // Clear previous list
        players.forEach(player => this.addPlayerToWaitingList(player, currentPlayerId));

        // Reset ready button text based on current player's status
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        if (currentPlayer) {
            this.readyButton.textContent = currentPlayer.isReady ? 'Not Ready' : 'Ready';
        } else {
            this.readyButton.textContent = 'Ready';
        }
    },

    addPlayerToWaitingList: function(player, currentPlayerId) {
        const playerItem = document.createElement('li');
        playerItem.id = `player-li-${player.id}`;
        let text = player.name;
        if (player.id === currentPlayerId) {
            text += ' (You)';
        }
        text += player.isReady ? ' - Ready' : ' - Not Ready';
        playerItem.textContent = text;
        this.playerList.appendChild(playerItem);
    },

    removePlayerFromWaitingList: function(playerId) {
        const playerItem = document.getElementById(`player-li-${playerId}`);
        if (playerItem) {
            playerItem.remove();
        }
    },

    updatePlayerReadyStatus: function(playerId, isReady) {
        const playerItem = document.getElementById(`player-li-${playerId}`);
        if (playerItem) {
            // Simplistic update: find the name part and append new status
            // Assumes name doesn't contain " - Ready" or " - Not Ready"
            let currentText = playerItem.textContent;
            if (currentText.includes('(You)')) {
                 currentText = currentText.substring(0, currentText.indexOf('(You)') + 5);
            } else {
                 currentText = currentText.split(' - ')[0];
            }
            playerItem.textContent = `${currentText} ${isReady ? ' - Ready' : ' - Not Ready'}`;
        }
        // If this is the current player, update their button
        if (playerId === Game.playerId) {
             this.readyButton.textContent = isReady ? 'Not Ready' : 'Ready';
        }
    },

    showGameScreen: function() {
        this.menuScreen.style.display = 'none';
        this.waitingScreen.style.display = 'none';
        this.hud.style.display = 'block';
        this.gameOverScreen.style.display = 'none';
    },

    showGameOverScreen: function(finalScore) {
        this.menuScreen.style.display = 'none';
        this.waitingScreen.style.display = 'none';
        this.hud.style.display = 'none'; // Or keep HUD visible if preferred
        this.gameOverScreen.style.display = 'block';
        this.finalScoreDisplay.textContent = finalScore;
    },

    updateHUD: function(score, health, fps) {
        if (this.hud.style.display !== 'block') return; // Only update if visible
        this.scoreDisplay.textContent = `Score: ${score}`;
        this.healthDisplay.textContent = `Health: ${health}`;
        if (fps !== undefined) {
             this.fpsDisplay.textContent = `FPS: ${Math.round(fps)}`;
        }
    }
};

// The Game object will call UI.init()
