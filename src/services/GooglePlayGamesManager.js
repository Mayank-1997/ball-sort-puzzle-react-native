/**
 * Google Play Games Services Manager for React Native Ball Sort Puzzle Game
 * Handles achievements, leaderboards, and cloud save functionality
 */

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  PlayGameServices,
  showAchievements,
  showLeaderboard,
  unlockAchievement,
  incrementAchievement,
  setLeaderboardScore,
  loadPlayerData,
  showSavedGamesUI,
  saveGame,
  loadGame,
} from 'react-native-game-services';
import AsyncStorage from '@react-native-async-storage/async-storage';

class GooglePlayGamesManagerClass {
  constructor() {
    this.initialized = false;
    this.isSignedIn = false;
    this.playerInfo = null;
    this.achievementsEnabled = true;
    this.leaderboardsEnabled = true;
    this.cloudSaveEnabled = true;
    
    // Achievement IDs (replace with your actual achievement IDs)
    this.achievementIds = {
      // Level completion achievements
      first_level: 'CgkIw8CKkP0CEAIQAQ', // Complete first level
      level_10: 'CgkIw8CKkP0CEAIQBA', // Complete 10 levels
      level_50: 'CgkIw8CKkP0CEAIQBg', // Complete 50 levels
      level_100: 'CgkIw8CKkP0CEAIQCA', // Complete 100 levels
      level_500: 'CgkIw8CKkP0CEAIQCg', // Complete 500 levels
      
      // Performance achievements
      perfect_level: 'CgkIw8CKkP0CEAIQDA', // Complete level with minimum moves
      speed_demon: 'CgkIw8CKkP0CEAIQDA', // Complete level under 30 seconds
      efficient_player: 'CgkIw8CKkP0CEAIQEA', // Complete 10 levels with minimum moves
      
      // Skill achievements
      no_hints: 'CgkIw8CKkP0CEAIQFA', // Complete 5 levels without hints
      comeback_king: 'CgkIw8CKkP0CEAIQGA', // Complete level after using undo 10+ times
      master_solver: 'CgkIw8CKkP0CEAIQHA', // Complete 25 levels in a row
      
      // Special achievements
      daily_player: 'CgkIw8CKkP0CEAIQIA', // Play for 7 consecutive days
      dedicated_player: 'CgkIw8CKkP0CEAIQJA', // Play for 30 consecutive days
      ball_master: 'CgkIw8CKkP0CEAIQKA', // Complete all 1000 levels
    };
    
    // Leaderboard IDs (replace with your actual leaderboard IDs)
    this.leaderboardIds = {
      total_levels: 'CgkIw8CKkP0CEAIQLA', // Total levels completed
      best_time: 'CgkIw8CKkP0CEAIQMA', // Fastest level completion
      total_score: 'CgkIw8CKkP0CEAIQNA', // Total game score
      perfect_levels: 'CgkIw8CKkP0CEAIQOA', // Perfect level completions
      weekly_levels: 'CgkIw8CKkP0CEAIQPA', // Weekly levels completed
    };
    
    // Cloud save data structure
    this.cloudSaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      gameProgress: null,
      settings: null,
      achievements: null,
    };
    
    console.log('🎮 Google Play Games Manager initialized');
  }

  /**
   * Initialize Google Play Games Services
   */
  async initialize() {
    try {
      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });

      // Initialize Play Games Services
      await PlayGameServices.initialize();
      
      // Check if user is already signed in
      await this.checkSignInStatus();
      
      this.initialized = true;
      console.log('✅ Google Play Games Services ready');
    } catch (error) {
      console.error('❌ Google Play Games Services initialization failed:', error);
      this.initialized = false;
    }
  }

  /**
   * Check current sign-in status
   */
  async checkSignInStatus() {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      this.isSignedIn = isSignedIn;
      
      if (isSignedIn) {
        const userInfo = await GoogleSignin.getCurrentUser();
        this.playerInfo = userInfo?.user;
        console.log('👤 Player signed in:', this.playerInfo?.name);
      }
      
      return isSignedIn;
    } catch (error) {
      console.warn('⚠️ Failed to check sign-in status:', error);
      return false;
    }
  }

  /**
   * Sign in to Google Play Games
   */
  async signIn() {
    if (!this.initialized) {
      console.warn('⚠️ Google Play Games Services not initialized');
      return { success: false, error: 'not_initialized' };
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      this.isSignedIn = true;
      this.playerInfo = userInfo.user;
      
      console.log('✅ Player signed in:', this.playerInfo.name);
      
      // Sync data after sign-in
      await this.syncCloudData();
      
      return { success: true, player: this.playerInfo };
    } catch (error) {
      console.error('❌ Sign-in failed:', error);
      
      let errorType = 'unknown';
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorType = 'cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorType = 'in_progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorType = 'play_services_unavailable';
      }
      
      return { success: false, error: errorType, details: error };
    }
  }

  /**
   * Sign out from Google Play Games
   */
  async signOut() {
    try {
      await GoogleSignin.signOut();
      this.isSignedIn = false;
      this.playerInfo = null;
      console.log('👋 Player signed out');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign-out failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(achievementKey, showUI = true) {
    if (!this.isSignedIn || !this.achievementsEnabled) {
      console.log('🚫 Cannot unlock achievement: not signed in or disabled');
      return false;
    }

    const achievementId = this.achievementIds[achievementKey];
    if (!achievementId) {
      console.warn('⚠️ Unknown achievement key:', achievementKey);
      return false;
    }

    try {
      await unlockAchievement(achievementId);
      console.log('🏆 Achievement unlocked:', achievementKey);
      
      if (showUI) {
        // Show achievement notification
        this.showAchievementToast(achievementKey);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to unlock achievement:', error);
      return false;
    }
  }

  /**
   * Increment achievement progress
   */
  async incrementAchievement(achievementKey, steps = 1) {
    if (!this.isSignedIn || !this.achievementsEnabled) {
      return false;
    }

    const achievementId = this.achievementIds[achievementKey];
    if (!achievementId) {
      console.warn('⚠️ Unknown achievement key:', achievementKey);
      return false;
    }

    try {
      await incrementAchievement(achievementId, steps);
      console.log(`📈 Achievement progress: ${achievementKey} +${steps}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to increment achievement:', error);
      return false;
    }
  }

  /**
   * Submit score to leaderboard
   */
  async submitScore(leaderboardKey, score) {
    if (!this.isSignedIn || !this.leaderboardsEnabled) {
      console.log('🚫 Cannot submit score: not signed in or disabled');
      return false;
    }

    const leaderboardId = this.leaderboardIds[leaderboardKey];
    if (!leaderboardId) {
      console.warn('⚠️ Unknown leaderboard key:', leaderboardKey);
      return false;
    }

    try {
      await setLeaderboardScore(leaderboardId, score);
      console.log(`📊 Score submitted to ${leaderboardKey}: ${score}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
      return false;
    }
  }

  /**
   * Show achievements UI
   */
  async showAchievements() {
    if (!this.isSignedIn) {
      console.log('🚫 Cannot show achievements: not signed in');
      return false;
    }

    try {
      await showAchievements();
      return true;
    } catch (error) {
      console.error('❌ Failed to show achievements:', error);
      return false;
    }
  }

  /**
   * Show leaderboard UI
   */
  async showLeaderboard(leaderboardKey = 'total_levels') {
    if (!this.isSignedIn) {
      console.log('🚫 Cannot show leaderboard: not signed in');
      return false;
    }

    const leaderboardId = this.leaderboardIds[leaderboardKey];
    if (!leaderboardId) {
      console.warn('⚠️ Unknown leaderboard key:', leaderboardKey);
      return false;
    }

    try {
      await showLeaderboard(leaderboardId);
      return true;
    } catch (error) {
      console.error('❌ Failed to show leaderboard:', error);
      return false;
    }
  }

  /**
   * Handle game events for achievements and leaderboards
   */
  async onGameEvent(eventType, data = {}) {
    if (!this.isSignedIn) return;

    try {
      switch (eventType) {
        case 'level_completed':
          await this.handleLevelCompleted(data);
          break;
        
        case 'perfect_level':
          await this.handlePerfectLevel(data);
          break;
        
        case 'fast_completion':
          await this.handleFastCompletion(data);
          break;
        
        case 'no_hints_used':
          await this.handleNoHintsUsed(data);
          break;
        
        case 'daily_play':
          await this.handleDailyPlay(data);
          break;
        
        case 'game_completed':
          await this.handleGameCompleted(data);
          break;
        
        default:
          console.log(`📊 Game event: ${eventType}`, data);
      }
    } catch (error) {
      console.error('❌ Error handling game event:', error);
    }
  }

  /**
   * Handle level completion events
   */
  async handleLevelCompleted(data) {
    const { level, moves, time, score, isNewRecord } = data;
    
    // Unlock milestone achievements
    if (level === 1) {
      await this.unlockAchievement('first_level');
    } else if (level === 10) {
      await this.unlockAchievement('level_10');
    } else if (level === 50) {
      await this.unlockAchievement('level_50');
    } else if (level === 100) {
      await this.unlockAchievement('level_100');
    } else if (level === 500) {
      await this.unlockAchievement('level_500');
    } else if (level === 1000) {
      await this.unlockAchievement('ball_master');
    }
    
    // Submit to leaderboards
    await this.submitScore('total_levels', level);
    await this.submitScore('total_score', score);
    
    // Check for perfect level (minimum moves)
    if (this.isPerfectLevel(level, moves)) {
      await this.incrementAchievement('perfect_levels');
      await this.onGameEvent('perfect_level', data);
    }
    
    // Check for fast completion
    if (time < 30) {
      await this.onGameEvent('fast_completion', data);
    }
  }

  /**
   * Handle perfect level completion
   */
  async handlePerfectLevel(data) {
    await this.unlockAchievement('perfect_level');
    await this.incrementAchievement('efficient_player');
  }

  /**
   * Handle fast completion
   */
  async handleFastCompletion(data) {
    await this.unlockAchievement('speed_demon');
    await this.submitScore('best_time', data.time);
  }

  /**
   * Handle no hints used
   */
  async handleNoHintsUsed(data) {
    await this.incrementAchievement('no_hints');
  }

  /**
   * Handle daily play
   */
  async handleDailyPlay(data) {
    const { consecutiveDays } = data;
    
    if (consecutiveDays >= 7) {
      await this.unlockAchievement('daily_player');
    }
    
    if (consecutiveDays >= 30) {
      await this.unlockAchievement('dedicated_player');
    }
  }

  /**
   * Handle game completion
   */
  async handleGameCompleted(data) {
    await this.unlockAchievement('ball_master');
  }

  /**
   * Save game data to cloud
   */
  async saveToCloud(gameData) {
    if (!this.isSignedIn || !this.cloudSaveEnabled) {
      console.log('🚫 Cannot save to cloud: not signed in or disabled');
      return false;
    }

    try {
      this.cloudSaveData = {
        ...this.cloudSaveData,
        timestamp: Date.now(),
        gameProgress: gameData.progress,
        settings: gameData.settings,
        achievements: gameData.achievements,
      };

      await saveGame('ball_sort_save', JSON.stringify(this.cloudSaveData));
      console.log('☁️ Game saved to cloud');
      return true;
    } catch (error) {
      console.error('❌ Failed to save to cloud:', error);
      return false;
    }
  }

  /**
   * Load game data from cloud
   */
  async loadFromCloud() {
    if (!this.isSignedIn || !this.cloudSaveEnabled) {
      console.log('🚫 Cannot load from cloud: not signed in or disabled');
      return null;
    }

    try {
      const cloudData = await loadGame('ball_sort_save');
      if (cloudData) {
        const parsedData = JSON.parse(cloudData);
        console.log('☁️ Game loaded from cloud');
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to load from cloud:', error);
      return null;
    }
  }

  /**
   * Sync local and cloud data
   */
  async syncCloudData() {
    if (!this.isSignedIn || !this.cloudSaveEnabled) return;

    try {
      // Load local data
      const localData = await this.getLocalGameData();
      
      // Load cloud data
      const cloudData = await this.loadFromCloud();
      
      if (!cloudData) {
        // No cloud data, upload local data
        await this.saveToCloud(localData);
        return;
      }

      // Compare timestamps and merge data
      const localTimestamp = localData.timestamp || 0;
      const cloudTimestamp = cloudData.timestamp || 0;

      if (cloudTimestamp > localTimestamp) {
        // Cloud data is newer, use it
        await this.mergeCloudDataToLocal(cloudData);
        console.log('☁️ Synced cloud data to local');
      } else if (localTimestamp > cloudTimestamp) {
        // Local data is newer, upload it
        await this.saveToCloud(localData);
        console.log('☁️ Synced local data to cloud');
      }
    } catch (error) {
      console.error('❌ Failed to sync cloud data:', error);
    }
  }

  /**
   * Show saved games UI
   */
  async showSavedGamesUI() {
    if (!this.isSignedIn) {
      console.log('🚫 Cannot show saved games: not signed in');
      return false;
    }

    try {
      await showSavedGamesUI();
      return true;
    } catch (error) {
      console.error('❌ Failed to show saved games UI:', error);
      return false;
    }
  }

  /**
   * Helper methods
   */
  isPerfectLevel(level, moves) {
    // Calculate minimum moves for the level
    // This would depend on your level generation algorithm
    const minMoves = this.calculateMinimumMoves(level);
    return moves <= minMoves;
  }

  calculateMinimumMoves(level) {
    // Simplified calculation - replace with actual algorithm
    return Math.max(1, Math.floor(level / 10) + 5);
  }

  async getLocalGameData() {
    try {
      const progress = await AsyncStorage.getItem('ballSortProgress');
      const settings = await AsyncStorage.getItem('ballSortSettings');
      const achievements = await AsyncStorage.getItem('ballSortAchievements');
      
      return {
        timestamp: Date.now(),
        progress: progress ? JSON.parse(progress) : null,
        settings: settings ? JSON.parse(settings) : null,
        achievements: achievements ? JSON.parse(achievements) : null,
      };
    } catch (error) {
      console.error('❌ Failed to get local game data:', error);
      return { timestamp: Date.now() };
    }
  }

  async mergeCloudDataToLocal(cloudData) {
    try {
      if (cloudData.progress) {
        await AsyncStorage.setItem('ballSortProgress', JSON.stringify(cloudData.progress));
      }
      if (cloudData.settings) {
        await AsyncStorage.setItem('ballSortSettings', JSON.stringify(cloudData.settings));
      }
      if (cloudData.achievements) {
        await AsyncStorage.setItem('ballSortAchievements', JSON.stringify(cloudData.achievements));
      }
    } catch (error) {
      console.error('❌ Failed to merge cloud data to local:', error);
    }
  }

  showAchievementToast(achievementKey) {
    // This would show a custom toast notification
    console.log('🏆 Achievement unlocked:', achievementKey);
  }

  /**
   * Get player information
   */
  getPlayerInfo() {
    return {
      isSignedIn: this.isSignedIn,
      playerInfo: this.playerInfo,
      initialized: this.initialized,
    };
  }

  /**
   * Enable/disable features
   */
  setAchievementsEnabled(enabled) {
    this.achievementsEnabled = enabled;
  }

  setLeaderboardsEnabled(enabled) {
    this.leaderboardsEnabled = enabled;
  }

  setCloudSaveEnabled(enabled) {
    this.cloudSaveEnabled = enabled;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.initialized = false;
    this.isSignedIn = false;
    this.playerInfo = null;
    console.log('🧹 Google Play Games Manager cleaned up');
  }
}

// Create singleton instance
export const GooglePlayGamesManager = new GooglePlayGamesManagerClass();

// Export class for testing
export { GooglePlayGamesManagerClass };