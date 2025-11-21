/**
 * Audio Manager for React Native Ball Sort Puzzle Game
 * Handles all sound effects and music playback
 */

import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AudioManagerClass {
  constructor() {
    this.soundEnabled = true;
    this.sounds = {};
    this.isInitialized = false;
    
    // Configure sound library
    Sound.setCategory('Playback');
    
    // Sound file mappings
    this.soundFiles = {
      select: 'select.mp3',
      pop: 'select.mp3', // Use select.mp3 as fallback for pop
      transfer: 'transfer.mp3',
      error: 'error.mp3',
      warning: 'error.mp3', // Use error.mp3 as fallback for warning
      victory: 'victory.mp3',
      congratulations: 'congratulations.mp3'
    };
    
    console.log('🔊 Audio Manager initialized');
  }

  /**
   * Initialize audio system
   */
  async initialize() {
    try {
      // Load sound preferences
      await this.loadSoundSettings();
      
      // Preload all sound files
      await this.preloadSounds();
      
      this.isInitialized = true;
      console.log('✅ Audio Manager ready');
    } catch (error) {
      console.error('❌ Audio Manager initialization failed:', error);
      // Continue without audio
      this.isInitialized = false;
    }
  }

  /**
   * Preload all sound files
   */
  async preloadSounds() {
    const soundPromises = Object.entries(this.soundFiles).map(([soundName, fileName]) => {
      return new Promise((resolve, reject) => {
        const sound = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.warn(`⚠️ Failed to load sound: ${soundName} (${fileName})`, error);
            // Continue without this sound
            this.sounds[soundName] = null;
            resolve();
          } else {
            // Set default volume
            sound.setVolume(0.7);
            this.sounds[soundName] = sound;
            console.log(`✅ Sound loaded: ${soundName}`);
            resolve();
          }
        });
      });
    });

    await Promise.all(soundPromises);
    console.log('🎵 All sounds preloaded');
  }

  /**
   * Play a sound effect
   */
  playSound(soundName) {
    if (!this.soundEnabled || !this.isInitialized) {
      return;
    }

    const sound = this.sounds[soundName];
    if (sound && sound !== null) {
      try {
        // Stop any currently playing instance of this sound
        sound.stop();
        
        // Play the sound
        sound.play((success) => {
          if (!success) {
            console.warn(`⚠️ Failed to play sound: ${soundName}`);
          }
        });
      } catch (error) {
        console.warn(`❌ Error playing sound ${soundName}:`, error);
      }
    } else {
      console.warn(`⚠️ Sound not available: ${soundName}`);
    }
  }

  /**
   * Play sound with custom volume
   */
  playSoundWithVolume(soundName, volume) {
    if (!this.soundEnabled || !this.isInitialized) {
      return;
    }

    const sound = this.sounds[soundName];
    if (sound && sound !== null) {
      try {
        sound.stop();
        sound.setVolume(Math.max(0, Math.min(1, volume)));
        sound.play((success) => {
          if (!success) {
            console.warn(`⚠️ Failed to play sound: ${soundName}`);
          }
          // Reset to default volume after playing
          setTimeout(() => {
            sound.setVolume(0.7);
          }, 100);
        });
      } catch (error) {
        console.warn(`❌ Error playing sound ${soundName}:`, error);
      }
    }
  }

  /**
   * Set master volume for all sounds
   */
  setVolume(volume) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    
    Object.values(this.sounds).forEach(sound => {
      if (sound && sound !== null) {
        sound.setVolume(normalizedVolume);
      }
    });
    
    console.log(`🔊 Volume set to: ${Math.round(normalizedVolume * 100)}%`);
  }

  /**
   * Enable or disable all sounds
   */
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    this.saveSoundSettings();
    console.log(`🔊 Sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.saveSoundSettings();
    
    // Play test sound if enabling
    if (this.soundEnabled) {
      setTimeout(() => {
        this.playSound('pop');
      }, 200);
    }
    
    console.log(`🔊 Sound toggled: ${this.soundEnabled ? 'ON' : 'OFF'}`);
    return this.soundEnabled;
  }

  /**
   * Check if sound is enabled
   */
  isSoundEnabled() {
    return this.soundEnabled;
  }

  /**
   * Play UI feedback sounds
   */
  playUISound(action) {
    switch (action) {
      case 'select':
      case 'tap':
      case 'click':
        this.playSound('select');
        break;
      case 'success':
      case 'move':
      case 'transfer':
        this.playSound('transfer');
        break;
      case 'error':
      case 'invalid':
      case 'fail':
        this.playSound('error');
        break;
      case 'back':
      case 'cancel':
      case 'deselect':
        this.playSound('pop');
        break;
      case 'warning':
      case 'timer':
        this.playSound('warning');
        break;
      case 'victory':
      case 'level_complete':
        this.playSound('victory');
        break;
      case 'achievement':
      case 'congratulations':
        this.playSound('congratulations');
        break;
      default:
        console.warn(`⚠️ Unknown UI sound action: ${action}`);
    }
  }

  /**
   * Play sequence of sounds
   */
  playSoundSequence(soundNames, interval = 300) {
    soundNames.forEach((soundName, index) => {
      setTimeout(() => {
        this.playSound(soundName);
      }, index * interval);
    });
  }

  /**
   * Pause all sounds
   */
  pauseAllSounds() {
    Object.values(this.sounds).forEach(sound => {
      if (sound && sound !== null) {
        try {
          sound.pause();
        } catch (error) {
          // Ignore pause errors
        }
      }
    });
  }

  /**
   * Stop all sounds
   */
  stopAllSounds() {
    Object.values(this.sounds).forEach(sound => {
      if (sound && sound !== null) {
        try {
          sound.stop();
        } catch (error) {
          // Ignore stop errors
        }
      }
    });
  }

  /**
   * Release all sound resources
   */
  releaseAllSounds() {
    Object.values(this.sounds).forEach(sound => {
      if (sound && sound !== null) {
        try {
          sound.release();
        } catch (error) {
          // Ignore release errors
        }
      }
    });
    
    this.sounds = {};
    this.isInitialized = false;
    console.log('🔊 All sounds released');
  }

  /**
   * Get sound information
   */
  getSoundInfo() {
    const soundInfo = {};
    
    Object.keys(this.soundFiles).forEach(soundName => {
      const sound = this.sounds[soundName];
      soundInfo[soundName] = {
        available: sound !== null && sound !== undefined,
        loaded: sound ? true : false,
        fileName: this.soundFiles[soundName]
      };
    });
    
    return {
      soundEnabled: this.soundEnabled,
      isInitialized: this.isInitialized,
      sounds: soundInfo
    };
  }

  /**
   * Test all sounds
   */
  testAllSounds() {
    if (!this.soundEnabled) {
      console.log('🔇 Sound is disabled - cannot test sounds');
      return;
    }
    
    const soundNames = Object.keys(this.soundFiles);
    console.log('🔊 Testing all sounds...');
    
    soundNames.forEach((soundName, index) => {
      setTimeout(() => {
        console.log(`Testing sound: ${soundName}`);
        this.playSound(soundName);
      }, index * 500);
    });
  }

  /**
   * Save sound settings to storage
   */
  async saveSoundSettings() {
    try {
      await AsyncStorage.setItem('ballSortSoundSettings', JSON.stringify({
        soundEnabled: this.soundEnabled,
        version: '1.0.0',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('⚠️ Failed to save sound settings:', error);
    }
  }

  /**
   * Load sound settings from storage
   */
  async loadSoundSettings() {
    try {
      const settings = await AsyncStorage.getItem('ballSortSoundSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.soundEnabled = parsedSettings.soundEnabled !== undefined ? 
                           parsedSettings.soundEnabled : true;
        console.log(`🔊 Sound settings loaded: ${this.soundEnabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load sound settings:', error);
      // Default to enabled
      this.soundEnabled = true;
    }
  }

  /**
   * Handle app state changes
   */
  handleAppStateChange(nextAppState) {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Pause all sounds when app goes to background
      this.pauseAllSounds();
    } else if (nextAppState === 'active') {
      // Resume sounds when app becomes active
      // (Individual sounds will be played as needed)
    }
  }

  /**
   * Create a sound test component (for debugging)
   */
  createSoundTest() {
    return {
      testSound: (soundName) => {
        console.log(`🧪 Testing sound: ${soundName}`);
        this.playSound(soundName);
      },
      testAllSounds: () => {
        this.testAllSounds();
      },
      getSoundInfo: () => {
        return this.getSoundInfo();
      },
      toggleSound: () => {
        return this.toggleSound();
      }
    };
  }
}

// Create singleton instance
export const AudioManager = new AudioManagerClass();

// Export class for testing
export { AudioManagerClass };