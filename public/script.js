// Game state
let gameState = {
    score: 0,
    basket: { x: 75, y: 150, width: 75, height: 60 }, // Office bin dimensions
    basketSpeed: 2, // pixels per frame
    basketDirection: 1, // 1 = right, -1 = left
    player: { x: 375, y: 300 }, // Fixed player position
    ballHeld: false,
    ballPosition: null,
    ballHoldStartTime: null,
    currentColor: null, // Current post-it color
    gameActive: false,
    gameTimeLeft: 20, // 20 seconds
    gameTimer: null,
    pointsByColor: {
        green: 0,
        yellow: 0,
        red: 0
    }
};

// Color definitions with difficulty and points
const POSTIT_COLORS = {
    green: { color: '#90EE90', difficulty: 'easy', collisionMultiplier: 1.5, points: 1 }, // Larger collision area
    yellow: { color: '#FFD700', difficulty: 'medium', collisionMultiplier: 1.0, points: 2 }, // Normal collision area
    red: { color: '#FF6B6B', difficulty: 'hard', collisionMultiplier: 0.6, points: 3 } // Smaller collision area
};

// Get random color
function getRandomColor() {
    const colors = Object.keys(POSTIT_COLORS);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return POSTIT_COLORS[randomColor];
}

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Active Post-Its in flight
const activePostIts = [];

// Crumpled Post-It class
class CrumpledPostIt {
    constructor(x, y, vx, vy, colorInfo) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 35;
        this.height = 35;
        this.rotation = 0;
        this.rotationSpeed = 0.1;
        this.gravity = 0.3;
        this.active = true;
        this.colorInfo = colorInfo; // Contains color, difficulty, collisionMultiplier
        this.color = colorInfo.color;
        this.difficulty = colorInfo.difficulty;
        this.collisionMultiplier = colorInfo.collisionMultiplier;
        
        // Generate crumple shape once (store it so it doesn't change each frame)
        this.crumplePoints = [];
        const points = 8;
        const baseRadius = this.width / 2;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = baseRadius * (0.7 + Math.random() * 0.3);
            this.crumplePoints.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        
        // Generate wrinkle lines once
        this.wrinkles = [];
        for (let i = 0; i < 3; i++) {
            this.wrinkles.push({
                x1: (Math.random() - 0.5) * this.width,
                y1: (Math.random() - 0.5) * this.height,
                x2: (Math.random() - 0.5) * this.width,
                y2: (Math.random() - 0.5) * this.height
            });
        }
    }

    update() {
        if (!this.active) return;

        // Apply gravity
        this.vy += this.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Check if out of bounds
        if (this.y > canvas.height + 50 || this.x < -50 || this.x > canvas.width + 50) {
            this.active = false;
            // Play "Buhhh" sound for unsuccessful throw
            playBuhhhSound();
            return;
        }

        // Check collision with basket (bird's eye view - simple rectangle collision)
        if (this.checkBasketCollision()) {
            this.active = false;
            // Add points based on color
            const colorKey = Object.keys(POSTIT_COLORS).find(key => POSTIT_COLORS[key].color === this.color);
            if (colorKey) {
                const points = POSTIT_COLORS[colorKey].points;
                gameState.score += points;
                gameState.pointsByColor[colorKey] += points;
                updateScore();
                createCheerAnimation();
                // Play cheer sound for successful dunk
                playCheerSound();
            }
            return;
        }
    }

    checkBasketCollision() {
        const basket = gameState.basket;
        // Adjust collision area based on difficulty (color)
        const effectiveWidth = this.width * this.collisionMultiplier;
        const effectiveHeight = this.height * this.collisionMultiplier;
        
        return this.x + effectiveWidth > basket.x &&
               this.x < basket.x + basket.width &&
               this.y + effectiveHeight > basket.y &&
               this.y < basket.y + basket.height;
    }

    draw() {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Draw crumpled post-it (irregular shape from bird's eye view)
        ctx.fillStyle = this.color;
        
        // Draw crumpled shape using pre-generated points
        ctx.beginPath();
        for (let i = 0; i < this.crumplePoints.length; i++) {
            const point = this.crumplePoints[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Draw border with some irregularity
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add some wrinkles/crumples (small lines)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.wrinkles.length; i++) {
            const wrinkle = this.wrinkles[i];
            ctx.beginPath();
            ctx.moveTo(wrinkle.x1, wrinkle.y1);
            ctx.lineTo(wrinkle.x2, wrinkle.y2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Drawing functions
function drawBasket() {
    const basket = gameState.basket;
    
    // Draw office bin from bird's eye view (top-down)
    // Bin body (rectangular)
    ctx.fillStyle = '#4A4A4A'; // Dark gray/black typical office bin
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    
    // Bin rim (slightly larger rectangle on top)
    ctx.fillStyle = '#2A2A2A';
    ctx.fillRect(basket.x - 3, basket.y - 3, basket.width + 6, 6);
    
    // Bin interior (lighter, showing depth)
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(basket.x + 5, basket.y + 5, basket.width - 10, basket.height - 10);
    
    // Bin label
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BIN', basket.x + basket.width / 2, basket.y + basket.height / 2 + 5);
}

function drawPlayer() {
    const player = gameState.player;
    const size = 20;
    
    // Draw player as X
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    
    // Draw X shape
    ctx.beginPath();
    ctx.moveTo(player.x - size, player.y - size);
    ctx.lineTo(player.x + size, player.y + size);
    ctx.moveTo(player.x + size, player.y - size);
    ctx.lineTo(player.x - size, player.y + size);
    ctx.stroke();
    
    // Draw circle around X
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, size + 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Player label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PLAYER', player.x, player.y + size + 15);
}

function drawHeldBall() {
    if (!gameState.ballHeld || !gameState.ballPosition || !gameState.currentColor) return;
    
    const ball = gameState.ballPosition;
    const holdTime = Date.now() - gameState.ballHoldStartTime;
    const power = Math.min(holdTime / 1000, 2); // Max 2 seconds for full power
    const size = 25 + (power * 5); // Post-it grows slightly as you hold
    
    // Draw held crumpled post-it
    ctx.save();
    ctx.translate(ball.x, ball.y);
    
    // Draw crumpled post-it shape (simplified for held state)
    ctx.fillStyle = gameState.currentColor.color;
    
    // Create simple crumpled effect
    ctx.beginPath();
    const points = 8;
    const baseRadius = size / 2;
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = baseRadius * (0.75 + (i % 3) * 0.1); // Slight variation
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw power indicator
    if (power > 0.1) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Update basket position (moves left to right)
function updateBasket() {
    const basket = gameState.basket;
    
    // Move basket
    basket.x += gameState.basketSpeed * gameState.basketDirection;
    
    // Bounce at edges
    if (basket.x + basket.width >= canvas.width) {
        basket.x = canvas.width - basket.width;
        gameState.basketDirection = -1; // Move left
    } else if (basket.x <= 0) {
        basket.x = 0;
        gameState.basketDirection = 1; // Move right
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update basket position
    updateBasket();
    
    // Draw game elements
    drawBasket();
    drawPlayer();
    drawHeldBall();
    
    // Update and draw active Post-Its
    for (let i = activePostIts.length - 1; i >= 0; i--) {
        const postIt = activePostIts[i];
        postIt.update();
        postIt.draw();
        
        if (!postIt.active) {
            activePostIts.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

// Throwing mechanics - hold to hold ball, release to throw
canvas.addEventListener('mousedown', (e) => {
    if (!gameState.gameActive) return; // Can only throw when game is active
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking near player (within 50 pixels)
    const dx = x - gameState.player.x;
    const dy = y - gameState.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 50 && !gameState.ballHeld) {
        gameState.ballHeld = true;
        gameState.ballPosition = { x: gameState.player.x, y: gameState.player.y };
        gameState.ballHoldStartTime = Date.now();
        // Assign random color when holding
        gameState.currentColor = getRandomColor();
        updateColorInfo();
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (!gameState.ballHeld) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate direction from player to mouse
    const dx = mouseX - gameState.player.x;
    const dy = mouseY - gameState.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate power based on hold time
    const holdTime = Date.now() - gameState.ballHoldStartTime;
    const power = Math.min(holdTime / 1000, 2); // Max 2 seconds = full power
    
    if (distance > 5) {
        // Normalize direction
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        // Calculate velocity (power affects speed)
        const baseSpeed = 8;
        const velocityX = normalizedDx * baseSpeed * (0.5 + power);
        const velocityY = normalizedDy * baseSpeed * (0.5 + power);
        
        // Create and throw crumpled post-it with current color
        const postIt = new CrumpledPostIt(
            gameState.player.x,
            gameState.player.y,
            velocityX,
            velocityY,
            gameState.currentColor
        );
        activePostIts.push(postIt);
    }
    
    // Reset hold state
    gameState.ballHeld = false;
    gameState.ballPosition = null;
    gameState.ballHoldStartTime = null;
    gameState.currentColor = null; // Reset color for next throw
    updateColorInfo(); // Clear color display
});

// UI Updates
function updateScore() {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = `
        <div class="score-item">
            <span>Total Score</span>
            <strong>${gameState.score}</strong>
        </div>
        <div class="score-item" style="margin-top: 10px; font-size: 12px;">
            <span>Green: ${gameState.pointsByColor.green} pts</span>
        </div>
        <div class="score-item" style="font-size: 12px;">
            <span>Yellow: ${gameState.pointsByColor.yellow} pts</span>
        </div>
        <div class="score-item" style="font-size: 12px;">
            <span>Red: ${gameState.pointsByColor.red} pts</span>
        </div>
    `;
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = gameState.gameTimeLeft;
    }
}

function startGame() {
    // Reset game state
    gameState.score = 0;
    gameState.gameTimeLeft = 20;
    gameState.gameActive = true;
    gameState.pointsByColor = { green: 0, yellow: 0, red: 0 };
    
    // Hide game over overlay
    const overlay = document.getElementById('gameOverOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // Hide start button
    const startButtonContainer = document.getElementById('startButtonContainer');
    if (startButtonContainer) {
        startButtonContainer.style.display = 'none';
    }
    
    // Clear any existing summary and update timer display
    const gameStatus = document.querySelector('.game-status');
    if (gameStatus) {
        const timerDisplay = gameStatus.querySelector('.timer-display');
        const instructionsText = gameStatus.querySelector('.instructions-text');
        
        // Keep timer and instructions, just hide start button
        if (timerDisplay) {
            timerDisplay.style.display = 'block';
        }
        if (instructionsText) {
            instructionsText.style.display = 'block';
        }
    }
    
    updateScore();
    updateTimer();
    
    // Start countdown timer
    gameState.gameTimer = setInterval(() => {
        gameState.gameTimeLeft--;
        updateTimer();
        
        if (gameState.gameTimeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameState.gameActive = false;
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
        gameState.gameTimer = null;
    }
    
    // Show blinking "Game Over" sign
    showGameOverSign();
    
    // Play jackpot sound
    playJackpotSound();
    
    // Show summary
    showGameSummary();
}

function showGameOverSign() {
    const overlay = document.getElementById('gameOverOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function playJackpotSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a jackpot sound with multiple tones
        const duration = 1.5; // seconds
        const sampleRate = audioContext.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a fanfare-like sound with multiple frequencies
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (C major chord)
        
        for (let i = 0; i < numSamples; i++) {
            let sample = 0;
            const t = i / sampleRate;
            
            // Add multiple tones with envelope
            frequencies.forEach((freq, index) => {
                const phase = 2 * Math.PI * freq * t;
                const envelope = Math.exp(-t * (2 + index * 0.5)); // Decay envelope
                sample += Math.sin(phase) * envelope * (0.3 / frequencies.length);
            });
            
            // Add some harmonics for richness
            sample += Math.sin(2 * Math.PI * 523.25 * 2 * t) * Math.exp(-t * 3) * 0.1;
            
            data[i] = sample;
        }
        
        // Play the sound
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch (error) {
        console.log('Could not play sound:', error);
        // Fallback: try using a simple beep
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1.5);
        } catch (e) {
            console.log('Could not play fallback sound:', e);
        }
    }
}

function playCheerSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Cheer sound: ascending notes
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(523.25, audioContext.currentTime + 0.1); // C5
        oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Could not play cheer sound:', error);
    }
}

function playBuhhhSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // "Buhhh" sound: descending low tone
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
        oscillator.type = 'sawtooth'; // More buzzy sound
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Could not play buhhh sound:', error);
    }
}

function showGameSummary() {
    const greenDunks = gameState.pointsByColor.green / 1;
    const yellowDunks = gameState.pointsByColor.yellow / 2;
    const redDunks = gameState.pointsByColor.red / 3;
    
    const summary = `
        <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h3 style="margin-bottom: 15px; color: #667eea;">Game Over!</h3>
            <div style="margin-bottom: 10px; font-size: 1.2em;">
                <strong>Total Score: ${gameState.score} points</strong>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee;">
                <h4 style="margin-bottom: 10px;">Points Summary:</h4>
                <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
                    <div style="width: 20px; height: 20px; background: #90EE90; border: 2px solid #333; border-radius: 3px;"></div>
                    <span>Green: ${gameState.pointsByColor.green} points (${greenDunks} dunk${greenDunks !== 1 ? 's' : ''} × 1 point)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
                    <div style="width: 20px; height: 20px; background: #FFD700; border: 2px solid #333; border-radius: 3px;"></div>
                    <span>Yellow: ${gameState.pointsByColor.yellow} points (${yellowDunks} dunk${yellowDunks !== 1 ? 's' : ''} × 2 points)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
                    <div style="width: 20px; height: 20px; background: #FF6B6B; border: 2px solid #333; border-radius: 3px;"></div>
                    <span>Red: ${gameState.pointsByColor.red} points (${redDunks} dunk${redDunks !== 1 ? 's' : ''} × 3 points)</span>
                </div>
            </div>
            <button id="restartBtn" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%; transition: background 0.3s;">
                Play Again
            </button>
        </div>
    `;
    
    const gameStatus = document.querySelector('.game-status');
    if (gameStatus) {
        gameStatus.innerHTML = summary;
        
        // Add restart button handler
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                // Reset game state
                gameState.gameActive = false;
                if (gameState.gameTimer) {
                    clearInterval(gameState.gameTimer);
                    gameState.gameTimer = null;
                }
                
                // Hide game over overlay
                const overlay = document.getElementById('gameOverOverlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
                
                // Show start button again
                const startButtonContainer = document.getElementById('startButtonContainer');
                if (startButtonContainer) {
                    startButtonContainer.style.display = 'block';
                }
                
                // Reset timer display
                const timer = document.getElementById('timer');
                if (timer) {
                    timer.textContent = '20';
                }
                
                // Clear summary and restore original layout
                const gameStatus = document.querySelector('.game-status');
                if (gameStatus) {
                    gameStatus.innerHTML = `
                        <div class="timer-display">
                            <div style="font-size: 2em; font-weight: bold; color: #667eea; text-align: center; margin-bottom: 10px;">
                                Time: <span id="timer">20</span>s
                            </div>
                        </div>
                        <div id="startButtonContainer" style="text-align: center; margin-bottom: 15px;">
                            <button id="startButton" style="padding: 15px 40px; font-size: 18px; font-weight: bold; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: background 0.3s;">
                                Start Game
                            </button>
                        </div>
                        <div class="instructions-text">
                            <p><strong>How to play:</strong></p>
                            <p>Click and hold near the player (X) to hold the post-it</p>
                            <p>Move mouse to aim, release to throw!</p>
                            <p style="margin-top: 10px; font-size: 12px; color: #666;">
                                <strong>Points:</strong> Green = 1 | Yellow = 2 | Red = 3
                            </p>
                            <div id="colorInfo"></div>
                        </div>
                    `;
                    
                    // Re-attach start button event listener
                    const newStartButton = document.getElementById('startButton');
                    if (newStartButton) {
                        newStartButton.addEventListener('click', () => {
                            startGame();
                        });
                        newStartButton.addEventListener('mouseenter', () => {
                            newStartButton.style.background = '#5568d3';
                        });
                        newStartButton.addEventListener('mouseleave', () => {
                            newStartButton.style.background = '#667eea';
                        });
                    }
                }
                
                updateScore();
            });
            
            // Add hover effect to restart button
            restartBtn.addEventListener('mouseenter', () => {
                restartBtn.style.background = '#5568d3';
            });
            restartBtn.addEventListener('mouseleave', () => {
                restartBtn.style.background = '#667eea';
            });
        }
    }
}

function showGameStatus(message) {
    const gameStatus = document.querySelector('.game-status');
    if (gameStatus) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'game-status-message';
        statusDiv.textContent = message;
        statusDiv.style.cssText = 'padding: 10px; background: #d4edda; color: #155724; border-radius: 5px; margin-top: 10px; text-align: center;';
        gameStatus.appendChild(statusDiv);
        setTimeout(() => statusDiv.remove(), 3000);
    }
}

// Show current color difficulty
function updateColorInfo() {
    const colorInfo = document.getElementById('colorInfo');
    if (!colorInfo) return;
    
    if (!gameState.currentColor || !gameState.gameActive) {
        colorInfo.innerHTML = '';
        return;
    }
    
    const difficultyText = gameState.currentColor.difficulty.toUpperCase();
    const difficultyLabel = gameState.currentColor.difficulty === 'easy' ? 'Easy' : 
                            gameState.currentColor.difficulty === 'medium' ? 'Medium' : 'Hard';
    const points = gameState.currentColor.points;
    colorInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 8px; background: #f0f0f0; border-radius: 5px;">
            <div style="width: 24px; height: 24px; background: ${gameState.currentColor.color}; border: 2px solid #333; border-radius: 3px;"></div>
            <span><strong>${difficultyText}</strong> - ${difficultyLabel} (${points} point${points > 1 ? 's' : ''})</span>
        </div>
    `;
}

function createCheerAnimation() {
    // Create confetti
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#F7DC6F'][Math.floor(Math.random() * 5)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 2000);
    }
    
    // Flash effect
    const flash = document.createElement('div');
    flash.className = 'cheer-animation';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
}

// Initialize game
function initGame() {
    updateScore();
    updateTimer();
    animate();
    
    // Add event listener for Start button
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', () => {
            startGame();
        });
        
        // Add hover effect
        startButton.addEventListener('mouseenter', () => {
            startButton.style.background = '#5568d3';
        });
        startButton.addEventListener('mouseleave', () => {
            startButton.style.background = '#667eea';
        });
    }
}

// Initialize game when page loads
initGame();
