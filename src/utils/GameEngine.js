/**
 * Game Logic and State Management for Ball Sort Puzzle
 * Converted from original HTML5 BallSortGame class
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {AudioManager} from '../services/AudioManager';
import {GooglePlayGamesManager} from '../services/GooglePlayGamesManager';
import {ProgressManager} from '../services/ProgressManager';
import {BallExpressionSystem} from './BallExpressionSystem';

export class GameEngine {
  constructor() {
    // Game state
    this.currentLevel = 1;
    this.maxLevel = 1000;
    this.maxLevelReached = 1;
    this.moves = 0;
    this.gameState = 'playing'; // 'playing', 'paused', 'completed', 'timeup'
    this.isPaused = false;
    
    // Timer system
    this.timeLeft = 0;
    this.timerId = null;
    this.levelTimeLimit = 60; // Default 60 seconds
    this.levelStartTime = Date.now();
    
    // Tubes and balls
    this.tubes = [];
    this.selectedTube = -1;
    this.animatingBall = null;
    this.animationProgress = 0;
    
    // Game configuration
    this.tubeWidth = 60;
    this.tubeHeight = 360;
    this.ballSize = 25;
    this.ballSpacing = 5;
    this.maxBallsPerTube = 6;
    
    // Colors for balls - Enhanced with more vibrant colors
    this.ballColors = [
      '#FF3B30', '#FF9500', '#FFCC02', '#34C759', 
      '#00C7BE', '#007AFF', '#5856D6', '#AF52DE',
      '#FF2D92', '#A2845E', '#8E8E93', '#FF6B35',
      '#6BCF7F', '#4A90E2', '#BD10E0', '#F5A623'
    ];
    
    // Game mechanics
    this.moveHistory = [];
    this.hintsUsed = 0;
    this.shufflesUsed = 0;
    this.maxHints = 3;
    this.maxShuffles = 2;
    
    // Sound system
    this.soundEnabled = true;
    
    // Premium features
    this.isPremium = false;
    
    // Initialize ball expression system
    this.expressionSystem = new BallExpressionSystem();
    
    // Event listeners for game state changes
    this.gameStateListeners = [];
    this.levelCompleteListeners = [];
    this.timerUpdateListeners = [];
    
    console.log('🎮 Game Engine initialized');
  }

  // Event system for React Native components
  addGameStateListener(callback) {
    this.gameStateListeners.push(callback);
  }

  addLevelCompleteListener(callback) {
    this.levelCompleteListeners.push(callback);
  }

  addTimerUpdateListener(callback) {
    this.timerUpdateListeners.push(callback);
  }

  notifyGameStateChange() {
    this.gameStateListeners.forEach(callback => callback(this.getGameState()));
  }

  notifyLevelComplete() {
    this.levelCompleteListeners.forEach(callback => callback({
      level: this.currentLevel,
      moves: this.moves,
      timeLeft: this.timeLeft,
      stars: this.calculateStars()
    }));
  }

  notifyTimerUpdate() {
    this.timerUpdateListeners.forEach(callback => callback({
      timeLeft: this.timeLeft,
      timeLimit: this.levelTimeLimit
    }));
  }

  getGameState() {
    return {
      currentLevel: this.currentLevel,
      maxLevelReached: this.maxLevelReached,
      moves: this.moves,
      gameState: this.gameState,
      isPaused: this.isPaused,
      timeLeft: this.timeLeft,
      timeLimit: this.levelTimeLimit,
      tubes: this.tubes,
      selectedTube: this.selectedTube,
      hintsUsed: this.hintsUsed,
      shufflesUsed: this.shufflesUsed,
      soundEnabled: this.soundEnabled,
      isPremium: this.isPremium
    };
  }

  /**
   * Initialize the game with level 1
   */
  async initializeGame() {
    try {
      await this.loadGameState();
      this.generateLevel(this.currentLevel, false);
      await this.saveGameState();
      this.notifyGameStateChange();
      console.log('🎯 Game initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing game:', error);
      // Fallback to level 1
      this.currentLevel = 1;
      this.maxLevelReached = 1;
      this.generateLevel(1, false);
    }
  }

  /**
   * Start a new game session
   */
  startGame() {
    this.gameState = 'playing';
    this.isPaused = false;
    this.startTimer();
    this.notifyGameStateChange();
    console.log('🎮 Game started');
  }

  /**
   * Generate level with progressive difficulty (1000 levels)
   */
  generateLevel(level, startTimer = false) {
    this.stopTimer();
    this.clearGameState();
    
    const config = this.getLevelConfig(level);
    this.levelTimeLimit = config.timeLimit;
    
    // Generate tubes based on configuration
    this.tubes = [];
    
    // Create filled tubes with balls
    for (let i = 0; i < config.filledTubes; i++) {
      const balls = [];
      for (let j = 0; j < config.ballsPerColor; j++) {
        const ballData = this.expressionSystem.convertBallToObject(i, level);
        balls.push(ballData);
      }
      this.tubes.push(balls);
    }
    
    // Add empty tubes
    for (let i = 0; i < config.emptyTubes; i++) {
      this.tubes.push([]);
    }
    
    // Shuffle the balls to create puzzle
    this.shuffleLevelBalls();
    
    if (startTimer) {
      this.startTimer();
    }
    
    this.notifyGameStateChange();
    console.log(`📋 Level ${level} generated with ${config.colors} colors`);
  }

  /**
   * Get level configuration based on progressive difficulty system
   */
  getLevelConfig(level) {
    let config = {};
    
    if (level >= 1 && level <= 20) {
      // Very Easy (1-20): 3 colors, 5 tubes, 1 minute
      config = {
        difficultyName: "Very Easy",
        colors: 3,
        ballsPerColor: 4,
        totalTubes: 5,
        filledTubes: 3,
        emptyTubes: 2,
        timeLimit: 60
      };
    } else if (level >= 21 && level <= 40) {
      // Easy (21-40): 4 colors, 6 tubes, 1 minute 10 seconds
      config = {
        difficultyName: "Easy",
        colors: 4,
        ballsPerColor: 4,
        totalTubes: 6,
        filledTubes: 4,
        emptyTubes: 2,
        timeLimit: 70
      };
    } else if (level >= 41 && level <= 100) {
      // Normal (41-100): 5 colors, 7 tubes, 1.5 minutes
      config = {
        difficultyName: "Normal",
        colors: 5,
        ballsPerColor: 4,
        totalTubes: 7,
        filledTubes: 5,
        emptyTubes: 2,
        timeLimit: 90
      };
    } else if (level >= 101 && level <= 200) {
      // Hard (101-200): 6 colors, 8 tubes, 2 minutes
      config = {
        difficultyName: "Hard",
        colors: 6,
        ballsPerColor: 4,
        totalTubes: 8,
        filledTubes: 6,
        emptyTubes: 2,
        timeLimit: 120
      };
    } else if (level >= 201 && level <= 500) {
      // Very Hard (201-500): 7 colors, 9 tubes, 2.5 minutes
      config = {
        difficultyName: "Very Hard",
        colors: 7,
        ballsPerColor: 4,
        totalTubes: 9,
        filledTubes: 7,
        emptyTubes: 2,
        timeLimit: 150
      };
    } else {
      // Expert (501-1000): 8+ colors, 10+ tubes, 3+ minutes
      const colorCount = Math.min(8 + Math.floor((level - 500) / 100), 12);
      config = {
        difficultyName: "Expert",
        colors: colorCount,
        ballsPerColor: 4,
        totalTubes: colorCount + 2,
        filledTubes: colorCount,
        emptyTubes: 2,
        timeLimit: 180 + Math.floor((level - 500) / 50) * 30
      };
    }
    
    return config;
  }

  /**
   * Shuffle balls to create puzzle
   */
  shuffleLevelBalls() {
    // Collect all balls
    const allBalls = [];
    this.tubes.forEach(tube => {
      allBalls.push(...tube);
    });
    
    // Clear all tubes
    this.tubes.forEach(tube => tube.length = 0);
    
    // Redistribute balls randomly but ensure solvability
    const shuffledBalls = this.shuffleArray([...allBalls]);
    let ballIndex = 0;
    
    // Fill tubes with shuffled balls (leave empty tubes empty)
    const config = this.getLevelConfig(this.currentLevel);
    for (let tubeIndex = 0; tubeIndex < config.filledTubes; tubeIndex++) {
      for (let i = 0; i < config.ballsPerColor; i++) {
        if (ballIndex < shuffledBalls.length) {
          this.tubes[tubeIndex].push(shuffledBalls[ballIndex]);
          ballIndex++;
        }
      }
    }
  }

  /**
   * Handle tube selection and ball movement
   */
  selectTube(tubeIndex) {
    if (this.gameState !== 'playing' || this.isPaused) {
      return false;
    }

    if (this.selectedTube === -1) {
      // First selection
      if (this.tubes[tubeIndex].length > 0) {
        this.selectedTube = tubeIndex;
        AudioManager.playSound('select');
        this.notifyGameStateChange();
        return true;
      } else {
        AudioManager.playSound('error');
        return false;
      }
    } else {
      // Second selection - attempt move
      if (tubeIndex === this.selectedTube) {
        // Deselect
        this.selectedTube = -1;
        AudioManager.playSound('pop');
        this.notifyGameStateChange();
        return true;
      } else {
        // Attempt to move ball(s)
        if (this.isValidMove(this.selectedTube, tubeIndex)) {
          this.moveBalls(this.selectedTube, tubeIndex);
          return true;
        } else {
          AudioManager.playSound('error');
          return false;
        }
      }
    }
  }

  /**
   * Check if a move is valid
   */
  isValidMove(fromTube, toTube) {
    const fromBalls = this.tubes[fromTube];
    const toBalls = this.tubes[toTube];
    
    if (fromBalls.length === 0) return false;
    if (toBalls.length >= this.maxBallsPerTube) return false;
    
    if (toBalls.length === 0) return true;
    
    // Check if top balls match
    const fromTopBall = fromBalls[fromBalls.length - 1];
    const toTopBall = toBalls[toBalls.length - 1];
    
    return this.expressionSystem.getBallColor(fromTopBall) === 
           this.expressionSystem.getBallColor(toTopBall);
  }

  /**
   * Move balls from one tube to another
   */
  moveBalls(fromTube, toTube) {
    const fromBalls = this.tubes[fromTube];
    const toBalls = this.tubes[toTube];
    
    // Count consecutive same-colored balls from top
    const consecutiveBalls = this.countConsecutiveBalls(fromTube);
    const availableSpace = this.maxBallsPerTube - toBalls.length;
    const ballsToMove = Math.min(consecutiveBalls, availableSpace);
    
    // Save move for undo
    this.moveHistory.push({
      from: fromTube,
      to: toTube,
      count: ballsToMove,
      timestamp: Date.now()
    });
    
    // Move balls
    const movedBalls = fromBalls.splice(-ballsToMove, ballsToMove);
    toBalls.push(...movedBalls);
    
    this.moves++;
    this.selectedTube = -1;
    
    AudioManager.playSound('transfer');
    
    // Check for level completion
    if (this.isLevelComplete()) {
      this.completeLevel();
    }
    
    this.notifyGameStateChange();
  }

  /**
   * Count consecutive same-colored balls from the top
   */
  countConsecutiveBalls(tubeIndex) {
    const balls = this.tubes[tubeIndex];
    if (balls.length === 0) return 0;
    
    const topBallColor = this.expressionSystem.getBallColor(balls[balls.length - 1]);
    let count = 1;
    
    for (let i = balls.length - 2; i >= 0; i--) {
      if (this.expressionSystem.getBallColor(balls[i]) === topBallColor) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  }

  /**
   * Check if level is complete
   */
  isLevelComplete() {
    return this.tubes.every(tube => {
      if (tube.length === 0) return true;
      if (tube.length !== this.maxBallsPerTube) return false;
      
      const firstColor = this.expressionSystem.getBallColor(tube[0]);
      return tube.every(ball => 
        this.expressionSystem.getBallColor(ball) === firstColor
      );
    });
  }

  /**
   * Complete current level
   */
  async completeLevel() {
    this.stopTimer();
    this.gameState = 'completed';
    
    // Calculate stars and bonus
    const stars = this.calculateStars();
    const timeBonus = Math.max(0, this.timeLeft * 10);
    
    // Update progress
    if (this.currentLevel >= this.maxLevelReached) {
      this.maxLevelReached = this.currentLevel + 1;
    }
    
    // Save progress
    await this.saveGameState();
    await ProgressManager.updateProgress({
      level: this.currentLevel,
      moves: this.moves,
      timeLeft: this.timeLeft,
      stars: stars
    });
    
    // Submit to Google Play Games
    await GooglePlayGamesManager.submitScore(this.currentLevel);
    await GooglePlayGamesManager.unlockAchievements(this.currentLevel, this.moves);
    
    AudioManager.playSound('victory');
    this.notifyLevelComplete();
    
    console.log(`🎉 Level ${this.currentLevel} completed with ${stars} stars!`);
  }

  /**
   * Calculate stars based on performance
   */
  calculateStars() {
    const optimalMoves = this.calculateOptimalMoves(this.currentLevel);
    const timePercentage = this.timeLeft / this.levelTimeLimit;
    
    if (this.moves <= optimalMoves && timePercentage > 0.5) {
      return 3; // Perfect performance
    } else if (this.moves <= optimalMoves * 1.5 && timePercentage > 0.25) {
      return 2; // Good performance
    } else {
      return 1; // Completed
    }
  }

  /**
   * Calculate optimal moves for level
   */
  calculateOptimalMoves(level) {
    const config = this.getLevelConfig(level);
    return config.colors * 4; // Rough estimate
  }

  /**
   * Timer system
   */
  startTimer() {
    this.stopTimer();
    this.timeLeft = this.levelTimeLimit;
    
    this.timerId = setInterval(() => {
      if (!this.isPaused && this.gameState === 'playing') {
        this.timeLeft--;
        this.notifyTimerUpdate();
        
        if (this.timeLeft <= 10) {
          // Warning for last 10 seconds
          AudioManager.playSound('warning');
        }
        
        if (this.timeLeft <= 0) {
          this.timeUp();
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  pauseTimer() {
    this.isPaused = true;
  }

  resumeTimer() {
    this.isPaused = false;
  }

  timeUp() {
    this.stopTimer();
    this.gameState = 'timeup';
    AudioManager.playSound('error');
    this.notifyGameStateChange();
  }

  addExtraTime(seconds) {
    this.timeLeft += seconds;
    this.notifyTimerUpdate();
  }

  /**
   * Game actions
   */
  restartLevel() {
    this.stopTimer();
    this.clearGameState();
    this.generateLevel(this.currentLevel, true);
    AudioManager.playSound('pop');
  }

  nextLevel() {
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      this.restartLevel();
    }
  }

  goToLevel(level) {
    if (level >= 1 && level <= this.maxLevelReached && level <= this.maxLevel) {
      this.currentLevel = level;
      this.restartLevel();
    }
  }

  pauseGame() {
    this.gameState = 'paused';
    this.pauseTimer();
    this.notifyGameStateChange();
  }

  resumeGame() {
    this.gameState = 'playing';
    this.resumeTimer();
    this.notifyGameStateChange();
  }

  /**
   * Hint system
   */
  showHint() {
    if (this.hintsUsed >= this.maxHints) {
      return null;
    }
    
    // Find a valid move
    for (let from = 0; from < this.tubes.length; from++) {
      for (let to = 0; to < this.tubes.length; to++) {
        if (from !== to && this.isValidMove(from, to)) {
          this.hintsUsed++;
          this.notifyGameStateChange();
          return { from, to };
        }
      }
    }
    
    return null;
  }

  /**
   * Undo system
   */
  undoMove() {
    if (this.moveHistory.length === 0) return false;
    
    const lastMove = this.moveHistory.pop();
    const fromBalls = this.tubes[lastMove.from];
    const toBalls = this.tubes[lastMove.to];
    
    // Move balls back
    const movedBalls = toBalls.splice(-lastMove.count, lastMove.count);
    fromBalls.push(...movedBalls);
    
    this.moves = Math.max(0, this.moves - 1);
    this.selectedTube = -1;
    
    AudioManager.playSound('pop');
    this.notifyGameStateChange();
    return true;
  }

  /**
   * Settings
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    AudioManager.setSoundEnabled(this.soundEnabled);
    this.saveGameState();
    this.notifyGameStateChange();
  }

  /**
   * Utility methods
   */
  clearGameState() {
    this.moves = 0;
    this.selectedTube = -1;
    this.gameState = 'playing';
    this.isPaused = false;
    this.moveHistory = [];
    this.hintsUsed = 0;
    this.shufflesUsed = 0;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Save/Load game state
   */
  async saveGameState() {
    try {
      const gameState = {
        currentLevel: this.currentLevel,
        maxLevelReached: this.maxLevelReached,
        soundEnabled: this.soundEnabled,
        isPremium: this.isPremium,
        version: '1.0.0',
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem('ballSortGameState', JSON.stringify(gameState));
      console.log('💾 Game state saved');
    } catch (error) {
      console.error('❌ Error saving game state:', error);
    }
  }

  async loadGameState() {
    try {
      const savedState = await AsyncStorage.getItem('ballSortGameState');
      if (savedState) {
        const gameState = JSON.parse(savedState);
        this.currentLevel = gameState.currentLevel || 1;
        this.maxLevelReached = gameState.maxLevelReached || 1;
        this.soundEnabled = gameState.soundEnabled !== undefined ? gameState.soundEnabled : true;
        this.isPremium = gameState.isPremium || false;
        
        console.log(`📱 Game state loaded: Level ${this.currentLevel}`);
      }
    } catch (error) {
      console.error('❌ Error loading game state:', error);
    }
  }

  async clearAllProgress() {
    try {
      await AsyncStorage.removeItem('ballSortGameState');
      await ProgressManager.clearProgress();
      
      this.currentLevel = 1;
      this.maxLevelReached = 1;
      this.isPremium = false;
      
      this.generateLevel(1, false);
      this.notifyGameStateChange();
      
      console.log('🔄 All progress cleared - reset to Level 1');
      return true;
    } catch (error) {
      console.error('❌ Error clearing progress:', error);
      return false;
    }
  }
}