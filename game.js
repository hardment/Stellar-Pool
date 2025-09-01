/**
 * STELLAR POOL - Main Game Implementation
 * 
 * Integrates all game systems and modules:
 * - Game initialization and state management
 * - Core game loop
 * - Game mechanics and rules
 */

// Import all game modules
import { AchievementManager } from './modules/achievements.js';
import { MenuSystem } from './modules/menu.js';
import { MobileSystem } from './modules/mobile.js';
import { PhysicsEngine } from './modules/physics.js';
import { SoundSystem } from './modules/sound.js';
import { StorageManager } from './modules/storage.js';
import { UIManager } from './modules/ui.js';

class StellarPoolGame {
  constructor() {
    console.log('%c🌟 STELLAR POOL - Initializing Game', 'font-size: 16px; color: #00c6ff; font-weight: bold;');
    
    // Game state
    this.gameState = {
      gameActive: false,      // Is game currently running?
      gamePaused: false,      // Is game paused?
      gameOver: false,        // Is game over?
      score: 0,               // Current score
      level: 1,               // Current level
      timeLeft: 60,           // Time left in seconds
      selectedStar: 'star1',  // Currently selected star
      startPos: { x: 0, y: 0 },  // Starting position for shooting
      currentPos: { x: 0, y: 0 }, // Current position for shooting
      dragging: false,        // Is player dragging a star?
      dragStartTime: 0,       // When drag started
      powerups: [],           // Active powerups
      camera: { x: 800, y: 400 }, // Camera position
      viewport: {             // Visible area
        width: window.innerWidth,
        height: window.innerHeight - 60, // Minus header height
      },
      settings: null,         // Game settings
      difficultyMultiplier: 1, // Increases with levels
    };
    
    this.timerInterval = null;
    this.gameLoopId = null;
    this.lastUpdateTime = 0;

    // Initialize all subsystems
    this.initializeSubsystems();

    // Set up event listeners
    this.setupEventListeners();
    
    console.log('✅ Game initialization complete');
  }

  /**
   * Initialize all game subsystems
   */
  initializeSubsystems() {
    console.log('🚀 Initializing subsystems...');

    // Create all subsystems
    this.storageManager = new StorageManager();
    this.soundSystem = new SoundSystem();
    this.physicsEngine = new PhysicsEngine(this);
    this.uiManager = new UIManager(this);
    this.achievementManager = new AchievementManager(this);
    this.menuSystem = new MenuSystem(this);
    this.mobileSystem = new MobileSystem(this);

    // Load saved settings
    this.loadSettings();

    console.log('✅ All subsystems initialized');
  }

  /**
   * Load saved settings from storage
   */
  loadSettings() {
    if (this.storageManager) {
      const savedSettings = this.storageManager.loadSettings();
      this.gameState.settings = savedSettings;

      // Apply sound settings
      if (this.soundSystem) {
        this.soundSystem.setEnabled(savedSettings.soundEnabled);
      }

      console.log('📂 Settings loaded:', savedSettings);
    }
  }

  /**
   * Set up DOM event listeners
   */
  setupEventListeners() {
    console.log('🔄 Setting up event listeners...');

    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Touch events are primarily handled by MobileSystem for complex gestures
  }

  /**
   * Starts a new game with given settings
   */
  startGame(settings = null) {
    console.log('🎮 Starting new game...');
    
    // Update settings if provided
    if (settings) {
      this.gameState.settings = settings;
    }

    // Reset game state
    this.gameState.gameActive = true;
    this.gameState.gamePaused = false;
    this.gameState.gameOver = false;
    this.gameState.score = 0;
    this.gameState.level = 1;
    this.gameState.timeLeft = this.gameState.settings.timeLimit || 60;
    this.gameState.powerups = [];
    this.gameState.difficultyMultiplier = 1;
    this.gameState.camera = { x: 800, y: 400 };

    // Initialize level
    this.initializeLevel();
    
    // Start game loop
    this.lastUpdateTime = performance.now();
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    
    // Start timer
    this.timerInterval = setInterval(this.updateTimer.bind(this), 1000);
    
    // Update UI
    this.uiManager.updateHUD(this.gameState);
    
    // Play background music
    this.soundSystem.playMusic('menu');
    
    console.log('🎮 Game started with settings:', this.gameState.settings);
  }

  /**
   * Initialize the current level
   */
  initializeLevel() {
    console.log(`🌟 Initializing level ${this.gameState.level}...`);

    // Reset stars and game elements
    this.physicsEngine.initialize();
    
    // Update UI
    this.uiManager.updateLevel(this.gameState.level);
    
    // Apply difficulty adjustments
    this.applyDifficultyAdjustments();
  }

  /**
   * Apply difficulty adjustments based on current level
   */
  applyDifficultyAdjustments() {
    // Adjust difficulty multiplier: 1.0 for level 1, increases with each level
    this.gameState.difficultyMultiplier = 1 + (this.gameState.level - 1) * 0.2;
    
    // Increase game speed slightly with level
    const gameSpeed = 1 + (this.gameState.level - 1) * 0.05;
    
    console.log(`🔄 Level ${this.gameState.level}: Difficulty multiplier ${this.gameState.difficultyMultiplier.toFixed(2)}, Game speed ${gameSpeed.toFixed(2)}`);
    
    // Additional level-specific adjustments can be added here
  }

  /**
   * Main game loop
   */
  gameLoop(timestamp) {
    // Skip if game is not active or is paused
    if (!this.gameState.gameActive || this.gameState.gamePaused) {
      this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }
    
    // Calculate delta time for smooth animations
    const deltaTime = timestamp - this.lastUpdateTime;
    this.lastUpdateTime = timestamp;
    
    // Update game physics
    this.physicsEngine.update(this.gameState);
    
    // Update powerups
    this.updatePowerups(deltaTime);
    
    // Check game conditions
    this.checkGameConditions();
    
    // Update UI
    this.uiManager.updateHUD(this.gameState);
    
    // Continue game loop
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Update active powerups
   */
  updatePowerups(deltaTime) {
    // Process each active powerup
    for (let i = this.gameState.powerups.length - 1; i >= 0; i--) {
      const powerup = this.gameState.powerups[i];
      
      // Reduce remaining time
      powerup.timeLeft -= deltaTime / 1000;
      
      // Update UI display
      this.uiManager.updatePowerupDisplay(powerup.type, true, powerup.timeLeft / powerup.duration);
      
      // Remove expired powerups
      if (powerup.timeLeft <= 0) {
        this.deactivatePowerup(powerup.type);
        this.gameState.powerups.splice(i, 1);
      }
    }
  }

  /**
   * Activate a powerup
   */
  activatePowerup(type, duration) {
    console.log(`🔆 Activating powerup: ${type} for ${duration} seconds`);
    
    // Add to active powerups
    this.gameState.powerups.push({
      type: type,
      duration: duration,
      timeLeft: duration
    });
    
    // Apply powerup effect
    switch (type) {
      case 'slowTime':
        // Slow down game speed
        break;
      case 'shield':
        // Add protection
        break;
      case 'magnet':
        // Attract nearby stars
        break;
    }
    
    // Play sound
    this.soundSystem.play('powerup');
    
    // Show notification
    this.uiManager.showNotification(`${type} activated!`, 'success');
    
    // Update UI
    this.uiManager.updatePowerupDisplay(type, true, 1.0);
  }

  /**
   * Deactivate a powerup
   */
  deactivatePowerup(type) {
    console.log(`🔆 Deactivating powerup: ${type}`);
    
    // Remove powerup effects
    switch (type) {
      case 'slowTime':
        // Restore normal game speed
        break;
      case 'shield':
        // Remove protection
        break;
      case 'magnet':
        // Remove attraction
        break;
    }
    
    // Update UI
    this.uiManager.updatePowerupDisplay(type, false);
    this.uiManager.showNotification(`${type} expired`, 'info');
  }

  /**
   * Check game conditions for level completion or game over
   */
  checkGameConditions() {
    // Check if all stars are in holes
    const allStarsInHoles = this.checkAllStarsInHoles();
    
    if (allStarsInHoles) {
      this.completeLevel();
    }
    
    // Check if time has run out
    if (this.gameState.timeLeft <= 0) {
      this.endGame();
    }
  }

  /**
   * Check if all stars are in holes
   */
  checkAllStarsInHoles() {
    // This is a simplified placeholder, actual implementation would check game state
    return false;
  }

  /**
   * Complete current level and advance to next
   */
  completeLevel() {
    console.log(`🎉 Level ${this.gameState.level} completed!`);
    
    // Award points for level completion
    const levelBonus = 500 * this.gameState.level;
    this.updateScore(levelBonus);
    
    // Increase level
    this.gameState.level++;
    
    // Show notification
    this.uiManager.showNotification(`Level ${this.gameState.level - 1} Complete! +${levelBonus} points`, 'success');
    
    // Play sound
    this.soundSystem.play('levelComplete');
    
    // Initialize next level
    this.initializeLevel();
    
    // Award achievement
    this.achievementManager.checkLevelAchievement(this.gameState.level);
  }

  /**
   * End the game (game over)
   */
  endGame() {
    console.log('🏁 Game over!');
    
    // Stop game activity
    this.gameState.gameActive = false;
    this.gameState.gameOver = true;
    
    // Clear timers
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.gameLoopId);
    
    // Play game over sound
    this.soundSystem.stopMusic();
    this.soundSystem.play('gameOver');
    
    // Show game over screen
    const stats = {
      finalScore: this.gameState.score,
      maxLevel: this.gameState.level,
      playTime: this.gameState.settings.timeLimit - this.gameState.timeLeft
    };
    
    this.uiManager.showGameOverScreen(stats);
    
    // Save high score
    this.saveHighScore();
    
    // Check achievements
    this.achievementManager.checkGameEndAchievements(stats);
  }

  /**
   * Save high score
   */
  saveHighScore() {
    if (this.storageManager) {
      const scoreData = {
        score: this.gameState.score,
        level: this.gameState.level,
        date: new Date().toISOString()
      };
      
      this.storageManager.saveHighScore(scoreData);
      console.log('💾 High score saved:', scoreData);
    }
  }

  /**
   * Update the game score
   */
  updateScore(points) {
    this.gameState.score += points;
    this.uiManager.updateScore(this.gameState.score);
    
    // Check for score-based achievements
    this.achievementManager.checkScoreAchievement(this.gameState.score);
  }

  /**
   * Update the game timer
   */
  updateTimer() {
    if (!this.gameState.gameActive || this.gameState.gamePaused) return;
    
    this.gameState.timeLeft--;
    
    // Update UI
    this.uiManager.updateTimer(this.gameState.timeLeft);
    
    // Play warning sound for low time
    if (this.gameState.timeLeft <= 10 && this.gameState.timeLeft > 0) {
      this.soundSystem.play('timeWarning');
    }
    
    // Check if time's up
    if (this.gameState.timeLeft <= 0) {
      this.endGame();
    }
  }

  /**
   * Toggle game pause state
   */
  togglePause() {
    this.gameState.gamePaused = !this.gameState.gamePaused;
    
    if (this.gameState.gamePaused) {
      // Show pause screen
      this.uiManager.showPauseScreen();
      console.log('⏸️ Game paused');
    } else {
      // Hide pause screen
      this.uiManager.hidePauseScreen();
      console.log('▶️ Game resumed');
    }
    
    return this.gameState.gamePaused;
  }

  /**
   * Switch active star
   */
  switchActiveStar() {
    this.physicsEngine.switchActiveStar();
  }

  /**
   * Update camera position
   */
  updateCameraPosition() {
    // Apply camera position to game board
    const board = document.getElementById('unifiedBoard');
    if (!board) return;
    
    // Calculate transform position to center camera on viewport
    const translateX = -this.gameState.camera.x + (this.gameState.viewport.width / 2);
    const translateY = -this.gameState.camera.y + (this.gameState.viewport.height / 2);
    
    // Apply transform
    board.style.transform = `translate(${translateX}px, ${translateY}px)`;
  }

  /**
   * Event handler for mouse down events
   */
  handleMouseDown(event) {
    if (!this.gameState.gameActive || this.gameState.gamePaused) return;
    
    // Check if a star was clicked
    const starElement = event.target.closest('.star');
    if (!starElement) return;
    
    // Ignore stars already in holes or in motion
    const starId = starElement.id;
    const star = this.physicsEngine.stars.find(s => s.id === starId);
    if (!star || star.moving || star.inHole) return;
    
    // Set selected star
    this.gameState.selectedStar = starId;
    
    // Update star selection visually
    this.physicsEngine.stars.forEach(s => {
      if (s.element) {
        s.element.classList.toggle('selected', s.id === starId);
      }
    });
    
    // Set up dragging for shooting
    this.gameState.dragging = true;
    this.gameState.dragStartTime = performance.now();
    
    // Record start position for shoot direction
    this.gameState.startPos = {
      x: event.clientX,
      y: event.clientY
    };
    
    this.gameState.currentPos = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Update aim line if enabled
    if (this.gameState.settings.showAimLine) {
      this.showAimLine(this.gameState.startPos, this.gameState.currentPos);
    }
    
    // Prevent default to avoid unwanted text selection
    event.preventDefault();
  }

  /**
   * Event handler for mouse move events
   */
  handleMouseMove(event) {
    if (!this.gameState.gameActive || !this.gameState.dragging) return;
    
    // Update current position
    this.gameState.currentPos = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Update aim line if enabled
    if (this.gameState.settings.showAimLine) {
      this.showAimLine(this.gameState.startPos, this.gameState.currentPos);
    }
    
    // Prevent default to avoid unwanted text selection
    event.preventDefault();
  }

  /**
   * Event handler for mouse up events
   */
  handleMouseUp(event) {
    if (!this.gameState.gameActive || !this.gameState.dragging) return;
    
    // Calculate drag time and distance
    const dragEndTime = performance.now();
    const dragTime = dragEndTime - this.gameState.dragStartTime;
    
    // Calculate drag distance
    const dx = this.gameState.startPos.x - this.gameState.currentPos.x;
    const dy = this.gameState.startPos.y - this.gameState.currentPos.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Only shoot if dragged a minimum distance
    if (dragDistance > 10) {
      // Shoot the star
      this.physicsEngine.shootStar(this.gameState, dragDistance, dragTime);
      
      // Play sound
      this.soundSystem.play('shoot');
      
      // Trigger mobile vibration
      this.mobileSystem.onStarShoot();
    }
    
    // Reset dragging state
    this.gameState.dragging = false;
    
    // Hide aim line
    this.hideAimLine();
    
    // Prevent default to avoid unwanted actions
    event.preventDefault();
  }

  /**
   * Event handlers for touch events (forwarded to mouse events)
   */
  handleTouchStart(event) {
    if (!event.touches || !event.touches[0]) return;
    
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    this.handleMouseDown(mouseEvent);
    event.preventDefault(); // Prevent scrolling
  }

  handleTouchMove(event) {
    if (!event.touches || !event.touches[0]) return;
    
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    this.handleMouseMove(mouseEvent);
    event.preventDefault(); // Prevent scrolling
  }

  handleTouchEnd(event) {
    const mouseEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    this.handleMouseUp(mouseEvent);
    event.preventDefault(); // Prevent unwanted clicks
  }

  /**
   * Event handler for keyboard events
   */
  handleKeyDown(event) {
    if (!this.gameState.gameActive) return;
    
    switch (event.key) {
      case 'Escape':
        // Toggle pause
        this.togglePause();
        break;
        
      case ' ':
        // Space bar - Switch active star
        if (!this.gameState.gamePaused) {
          this.switchActiveStar();
        }
        break;
        
      case 'ArrowLeft':
        // Move camera left
        if (!this.gameState.gamePaused) {
          this.gameState.camera.x -= 20;
          this.updateCameraPosition();
        }
        break;
        
      case 'ArrowRight':
        // Move camera right
        if (!this.gameState.gamePaused) {
          this.gameState.camera.x += 20;
          this.updateCameraPosition();
        }
        break;
        
      case 'ArrowUp':
        // Move camera up
        if (!this.gameState.gamePaused) {
          this.gameState.camera.y -= 20;
          this.updateCameraPosition();
        }
        break;
        
      case 'ArrowDown':
        // Move camera down
        if (!this.gameState.gamePaused) {
          this.gameState.camera.y += 20;
          this.updateCameraPosition();
        }
        break;
    }
  }

  /**
   * Show aim line when dragging
   */
  showAimLine(startPos, currentPos) {
    // Find or create aim line element
    let aimLine = document.getElementById('aimLine');
    if (!aimLine) {
      aimLine = document.createElement('div');
      aimLine.id = 'aimLine';
      document.getElementById('gameContainer').appendChild(aimLine);
    }
    
    // Calculate line properties
    const dx = startPos.x - currentPos.x;
    const dy = startPos.y - currentPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Set line style
    aimLine.style.width = `${distance}px`;
    aimLine.style.left = `${currentPos.x}px`;
    aimLine.style.top = `${currentPos.y}px`;
    aimLine.style.transform = `rotate(${angle}deg)`;
    aimLine.style.display = 'block';
  }

  /**
   * Hide aim line
   */
  hideAimLine() {
    const aimLine = document.getElementById('aimLine');
    if (aimLine) {
      aimLine.style.display = 'none';
    }
  }

  /**
   * Event callbacks for physics events
   */
  onStarBounce(starId) {
    // Play bounce sound
    this.soundSystem.play('bounce');
  }

  onStarInHole(starId) {
    // Award points
    this.updateScore(100);
    
    // Play success sound
    this.soundSystem.play('hole');
    
    // Trigger mobile vibration
    this.mobileSystem.onStarInHole();
    
    // Show notification
    this.uiManager.showNotification('Star in hole! +100 points', 'success');
  }

  onStarHitMeteorite(starId) {
    // Penalize points
    this.updateScore(-50);
    
    // Play explosion sound
    this.soundSystem.play('explosion');
    
    // Trigger mobile vibration
    this.mobileSystem.onMeteoriteHit();
    
    // Show notification
    this.uiManager.showNotification('Hit meteorite! -50 points', 'warning');
  }

  /**
   * Clean up all game resources
   */
  cleanup() {
    // Stop game activity
    this.gameState.gameActive = false;
    
    // Clear timers
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.gameLoopId);
    
    // Clean up subsystems
    this.soundSystem.cleanup();
    this.physicsEngine.cleanup();
    this.uiManager.cleanup();
    this.mobileSystem.cleanup();
    
    // Remove event listeners
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    console.log('🧹 Game resources cleaned up');
  }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.stellarPoolGame = new StellarPoolGame();
});

// Export the game class
export { StellarPoolGame };