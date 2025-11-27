import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ProgressManager - Handles game progress, level completion, and user stats
 */
export class ProgressManager {
  static STORAGE_KEYS = {
    CURRENT_LEVEL: '@BallSort:currentLevel',
    COMPLETED_LEVELS: '@BallSort:completedLevels',
    TOTAL_MOVES: '@BallSort:totalMoves',
    TOTAL_TIME: '@BallSort:totalTime',
    BEST_SCORES: '@BallSort:bestScores',
    ACHIEVEMENTS: '@BallSort:achievements',
    COINS: '@BallSort:coins',
    HINTS_USED: '@BallSort:hintsUsed',
  };

  /**
   * Get current level
   */
  static async getCurrentLevel() {
    try {
      const level = await AsyncStorage.getItem(this.STORAGE_KEYS.CURRENT_LEVEL);
      return level ? parseInt(level, 10) : 1;
    } catch (error) {
      console.error('Error getting current level:', error);
      return 1;
    }
  }

  /**
   * Set current level
   */
  static async setCurrentLevel(level) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.CURRENT_LEVEL, level.toString());
      return true;
    } catch (error) {
      console.error('Error setting current level:', error);
      return false;
    }
  }

  /**
   * Get completed levels
   */
  static async getCompletedLevels() {
    try {
      const levels = await AsyncStorage.getItem(this.STORAGE_KEYS.COMPLETED_LEVELS);
      return levels ? JSON.parse(levels) : [];
    } catch (error) {
      console.error('Error getting completed levels:', error);
      return [];
    }
  }

  /**
   * Mark level as completed
   */
  static async markLevelCompleted(level, moves, time) {
    try {
      const completedLevels = await this.getCompletedLevels();
      if (!completedLevels.includes(level)) {
        completedLevels.push(level);
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.COMPLETED_LEVELS,
          JSON.stringify(completedLevels)
        );
      }

      // Save best score for this level
      await this.saveBestScore(level, moves, time);

      return true;
    } catch (error) {
      console.error('Error marking level completed:', error);
      return false;
    }
  }

  /**
   * Get best score for a level
   */
  static async getBestScore(level) {
    try {
      const scores = await AsyncStorage.getItem(this.STORAGE_KEYS.BEST_SCORES);
      const allScores = scores ? JSON.parse(scores) : {};
      return allScores[level] || null;
    } catch (error) {
      console.error('Error getting best score:', error);
      return null;
    }
  }

  /**
   * Save best score for a level
   */
  static async saveBestScore(level, moves, time) {
    try {
      const scores = await AsyncStorage.getItem(this.STORAGE_KEYS.BEST_SCORES);
      const allScores = scores ? JSON.parse(scores) : {};
      
      const currentBest = allScores[level];
      if (!currentBest || moves < currentBest.moves) {
        allScores[level] = { moves, time, date: new Date().toISOString() };
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.BEST_SCORES,
          JSON.stringify(allScores)
        );
      }

      return true;
    } catch (error) {
      console.error('Error saving best score:', error);
      return false;
    }
  }

  /**
   * Get total stats
   */
  static async getTotalStats() {
    try {
      const [moves, time, hintsUsed] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.TOTAL_MOVES),
        AsyncStorage.getItem(this.STORAGE_KEYS.TOTAL_TIME),
        AsyncStorage.getItem(this.STORAGE_KEYS.HINTS_USED),
      ]);

      return {
        totalMoves: moves ? parseInt(moves, 10) : 0,
        totalTime: time ? parseInt(time, 10) : 0,
        hintsUsed: hintsUsed ? parseInt(hintsUsed, 10) : 0,
      };
    } catch (error) {
      console.error('Error getting total stats:', error);
      return { totalMoves: 0, totalTime: 0, hintsUsed: 0 };
    }
  }

  /**
   * Update total stats
   */
  static async updateStats(moves, time) {
    try {
      const stats = await this.getTotalStats();
      
      await Promise.all([
        AsyncStorage.setItem(
          this.STORAGE_KEYS.TOTAL_MOVES,
          (stats.totalMoves + moves).toString()
        ),
        AsyncStorage.setItem(
          this.STORAGE_KEYS.TOTAL_TIME,
          (stats.totalTime + time).toString()
        ),
      ]);

      return true;
    } catch (error) {
      console.error('Error updating stats:', error);
      return false;
    }
  }

  /**
   * Get coins
   */
  static async getCoins() {
    try {
      const coins = await AsyncStorage.getItem(this.STORAGE_KEYS.COINS);
      return coins ? parseInt(coins, 10) : 0;
    } catch (error) {
      console.error('Error getting coins:', error);
      return 0;
    }
  }

  /**
   * Add coins
   */
  static async addCoins(amount) {
    try {
      const currentCoins = await this.getCoins();
      const newTotal = currentCoins + amount;
      await AsyncStorage.setItem(this.STORAGE_KEYS.COINS, newTotal.toString());
      return newTotal;
    } catch (error) {
      console.error('Error adding coins:', error);
      return 0;
    }
  }

  /**
   * Spend coins
   */
  static async spendCoins(amount) {
    try {
      const currentCoins = await this.getCoins();
      if (currentCoins >= amount) {
        const newTotal = currentCoins - amount;
        await AsyncStorage.setItem(this.STORAGE_KEYS.COINS, newTotal.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error spending coins:', error);
      return false;
    }
  }

  /**
   * Reset all progress
   */
  static async resetProgress() {
    try {
      await AsyncStorage.multiRemove(Object.values(this.STORAGE_KEYS));
      return true;
    } catch (error) {
      console.error('Error resetting progress:', error);
      return false;
    }
  }

  /**
   * Export progress data
   */
  static async exportProgress() {
    try {
      const keys = Object.values(this.STORAGE_KEYS);
      const data = await AsyncStorage.multiGet(keys);
      
      const progress = {};
      data.forEach(([key, value]) => {
        if (value !== null) {
          progress[key] = value;
        }
      });

      return progress;
    } catch (error) {
      console.error('Error exporting progress:', error);
      return null;
    }
  }

  /**
   * Import progress data
   */
  static async importProgress(progressData) {
    try {
      const entries = Object.entries(progressData);
      await AsyncStorage.multiSet(entries);
      return true;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }
}

export default ProgressManager;
