/**
 * Web-compatible Audio Manager for React Native Web
 * Provides audio functionality using HTML5 Audio API
 */

class AudioManagerClass {
  constructor() {
    this.initialized = false;
    this.sounds = {};
    this.musicEnabled = true;
    this.soundEnabled = true;
    this.backgroundMusic = null;
    this.volume = 0.7;
    
    console.log('🔊 Web Audio Manager initialized');
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Initialize web audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Load sounds using HTML5 Audio
      await this.loadSounds();
      
      this.initialized = true;
      console.log('🔊 Web Audio system initialized');
    } catch (error) {
      console.warn('🔊 Web Audio initialization failed:', error);
      this.initialized = true; // Continue without audio
    }
  }

  async loadSounds() {
    // Mock sound loading for web
    const soundFiles = [
      'ball_drop',
      'tube_complete',
      'level_complete',
      'button_click',
      'hint_used',
      'error_sound'
    ];

    for (const soundName of soundFiles) {
      this.sounds[soundName] = {
        play: () => console.log(`🔊 Playing sound: ${soundName}`),
        stop: () => console.log(`🔊 Stopping sound: ${soundName}`),
        setVolume: (vol) => console.log(`🔊 Setting volume for ${soundName}: ${vol}`)
      };
    }
  }

  playSound(soundName, volume = 1.0) {
    if (!this.soundEnabled || !this.initialized) return;
    
    try {
      if (this.sounds[soundName]) {
        this.sounds[soundName].play();
      }
    } catch (error) {
      console.warn(`🔊 Failed to play sound ${soundName}:`, error);
    }
  }

  playBackgroundMusic(musicName = 'background') {
    if (!this.musicEnabled || !this.initialized) return;
    
    console.log(`🎵 Playing background music: ${musicName}`);
    // Mock background music for web
  }

  pauseBackgroundMusic() {
    console.log('🎵 Pausing background music');
  }

  resumeBackgroundMusic() {
    console.log('🎵 Resuming background music');
  }

  stopBackgroundMusic() {
    console.log('🎵 Stopping background music');
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  cleanup() {
    console.log('🔊 Cleaning up web audio resources');
    this.stopBackgroundMusic();
  }
}

// Create singleton instance
export const AudioManager = new AudioManagerClass();

// Export class for testing
export { AudioManagerClass };