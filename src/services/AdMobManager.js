/**
 * AdMob Manager for React Native Ball Sort Puzzle Game
 * Handles banner ads, interstitial ads, and rewarded ads
 */

import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  GAMBannerAd,
  GAMInterstitialAd,
  GAMRewardedAd,
} from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class AdMobManagerClass {
  constructor() {
    this.initialized = false;
    this.adsEnabled = true;
    this.premiumUser = false;
    
    // Ad unit IDs (using test IDs for development)
    this.adUnitIds = {
      banner: __DEV__ ? TestIds.BANNER : Platform.select({
        ios: 'ca-app-pub-YOUR_PUBLISHER_ID/BANNER_AD_UNIT_ID',
        android: 'ca-app-pub-YOUR_PUBLISHER_ID/BANNER_AD_UNIT_ID',
      }),
      interstitial: __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
        ios: 'ca-app-pub-YOUR_PUBLISHER_ID/INTERSTITIAL_AD_UNIT_ID',
        android: 'ca-app-pub-YOUR_PUBLISHER_ID/INTERSTITIAL_AD_UNIT_ID',
      }),
      rewarded: __DEV__ ? TestIds.REWARDED : Platform.select({
        ios: 'ca-app-pub-YOUR_PUBLISHER_ID/REWARDED_AD_UNIT_ID',
        android: 'ca-app-pub-YOUR_PUBLISHER_ID/REWARDED_AD_UNIT_ID',
      }),
    };

    // Ad instances
    this.interstitialAd = null;
    this.rewardedAd = null;
    
    // Ad state tracking
    this.interstitialLoaded = false;
    this.rewardedLoaded = false;
    this.lastInterstitialShow = 0;
    this.interstitialCooldown = 90000; // 90 seconds
    
    // Game event counters for ad triggers
    this.levelCompletions = 0;
    this.gameStarts = 0;
    this.hintsUsed = 0;
    
    console.log('📱 AdMob Manager initialized');
  }

  /**
   * Initialize AdMob system
   */
  async initialize() {
    try {
      // Load ad preferences
      await this.loadAdSettings();
      
      // Check premium status
      await this.checkPremiumStatus();
      
      if (this.shouldShowAds()) {
        // Preload interstitial and rewarded ads
        this.loadInterstitialAd();
        this.loadRewardedAd();
      }
      
      this.initialized = true;
      console.log('✅ AdMob Manager ready');
    } catch (error) {
      console.error('❌ AdMob Manager initialization failed:', error);
      this.initialized = false;
    }
  }

  /**
   * Check if ads should be shown
   */
  shouldShowAds() {
    return this.adsEnabled && !this.premiumUser && this.initialized;
  }

  /**
   * Load interstitial ad
   */
  loadInterstitialAd() {
    if (!this.shouldShowAds()) return;

    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(this.adUnitIds.interstitial, {
        requestNonPersonalizedAdsOnly: false,
      });

      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        this.interstitialLoaded = true;
        console.log('🎯 Interstitial ad loaded');
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn('⚠️ Interstitial ad error:', error);
        this.interstitialLoaded = false;
        // Retry loading after delay
        setTimeout(() => this.loadInterstitialAd(), 30000);
      });

      this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
        console.log('📱 Interstitial ad opened');
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('❌ Interstitial ad closed');
        this.interstitialLoaded = false;
        this.lastInterstitialShow = Date.now();
        // Preload next ad
        setTimeout(() => this.loadInterstitialAd(), 1000);
      });

      this.interstitialAd.load();
    } catch (error) {
      console.error('❌ Failed to load interstitial ad:', error);
    }
  }

  /**
   * Load rewarded ad
   */
  loadRewardedAd() {
    if (!this.shouldShowAds()) return;

    try {
      this.rewardedAd = RewardedAd.createForAdRequest(this.adUnitIds.rewarded, {
        requestNonPersonalizedAdsOnly: false,
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.rewardedLoaded = true;
        console.log('🎁 Rewarded ad loaded');
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
        console.warn('⚠️ Rewarded ad error:', error);
        this.rewardedLoaded = false;
        // Retry loading after delay
        setTimeout(() => this.loadRewardedAd(), 30000);
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.OPENED, () => {
        console.log('📱 Rewarded ad opened');
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
        console.log('❌ Rewarded ad closed');
        this.rewardedLoaded = false;
        // Preload next ad
        setTimeout(() => this.loadRewardedAd(), 1000);
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('🎁 Reward earned:', reward);
        this.handleRewardEarned(reward);
      });

      this.rewardedAd.load();
    } catch (error) {
      console.error('❌ Failed to load rewarded ad:', error);
    }
  }

  /**
   * Show interstitial ad
   */
  async showInterstitialAd(context = 'general') {
    if (!this.shouldShowAds() || !this.interstitialLoaded) {
      console.log('🚫 Interstitial ad not available');
      return false;
    }

    // Check cooldown
    const now = Date.now();
    if (now - this.lastInterstitialShow < this.interstitialCooldown) {
      console.log('⏰ Interstitial ad on cooldown');
      return false;
    }

    try {
      console.log(`📱 Showing interstitial ad (${context})`);
      await this.interstitialAd.show();
      return true;
    } catch (error) {
      console.error('❌ Failed to show interstitial ad:', error);
      return false;
    }
  }

  /**
   * Show rewarded ad
   */
  async showRewardedAd(context = 'general') {
    if (!this.shouldShowAds() || !this.rewardedLoaded) {
      console.log('🚫 Rewarded ad not available');
      return { success: false, reason: 'not_available' };
    }

    try {
      console.log(`🎁 Showing rewarded ad (${context})`);
      
      return new Promise((resolve) => {
        let rewardEarned = false;
        
        const earnedListener = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD, 
          (reward) => {
            rewardEarned = true;
            console.log('🎁 Reward earned in promise:', reward);
          }
        );

        const closedListener = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.CLOSED, 
          () => {
            earnedListener();
            closedListener();
            resolve({ 
              success: true, 
              rewardEarned, 
              context 
            });
          }
        );

        this.rewardedAd.show().catch((error) => {
          earnedListener();
          closedListener();
          console.error('❌ Failed to show rewarded ad:', error);
          resolve({ success: false, reason: 'show_failed', error });
        });
      });
    } catch (error) {
      console.error('❌ Failed to show rewarded ad:', error);
      return { success: false, reason: 'exception', error };
    }
  }

  /**
   * Check if interstitial ad is ready
   */
  isInterstitialReady() {
    return this.shouldShowAds() && this.interstitialLoaded;
  }

  /**
   * Check if rewarded ad is ready
   */
  isRewardedReady() {
    return this.shouldShowAds() && this.rewardedLoaded;
  }

  /**
   * Handle game events that might trigger ads
   */
  onGameEvent(eventType, data = {}) {
    if (!this.shouldShowAds()) return;

    switch (eventType) {
      case 'level_completed':
        this.levelCompletions++;
        // Show interstitial every 3 level completions
        if (this.levelCompletions % 3 === 0) {
          setTimeout(() => {
            this.showInterstitialAd('level_completed');
          }, 2000); // Delay to avoid interrupting celebration
        }
        break;

      case 'game_started':
        this.gameStarts++;
        // Show interstitial every 5 game starts
        if (this.gameStarts % 5 === 0 && this.gameStarts > 0) {
          setTimeout(() => {
            this.showInterstitialAd('game_started');
          }, 1000);
        }
        break;

      case 'hint_used':
        this.hintsUsed++;
        break;

      case 'game_over':
        // Show interstitial on game over occasionally
        if (Math.random() < 0.3) { // 30% chance
          setTimeout(() => {
            this.showInterstitialAd('game_over');
          }, 1500);
        }
        break;

      default:
        console.log(`📊 Game event: ${eventType}`, data);
    }
  }

  /**
   * Show rewarded ad for specific benefits
   */
  async showRewardedAdForBenefit(benefit) {
    const benefitConfigs = {
      'extra_hints': {
        description: 'Watch an ad to get 3 extra hints',
        reward: { type: 'hints', amount: 3 }
      },
      'skip_level': {
        description: 'Watch an ad to skip this level',
        reward: { type: 'skip', amount: 1 }
      },
      'extra_time': {
        description: 'Watch an ad to get 60 extra seconds',
        reward: { type: 'time', amount: 60 }
      },
      'double_score': {
        description: 'Watch an ad to double your score',
        reward: { type: 'score_multiplier', amount: 2 }
      },
      'remove_ads': {
        description: 'Watch an ad to remove ads for 1 hour',
        reward: { type: 'ad_free', amount: 3600 }
      }
    };

    const config = benefitConfigs[benefit];
    if (!config) {
      console.error('❌ Unknown reward benefit:', benefit);
      return { success: false, reason: 'unknown_benefit' };
    }

    const result = await this.showRewardedAd(benefit);
    
    if (result.success && result.rewardEarned) {
      // Process the reward
      await this.processReward(config.reward, benefit);
      return { success: true, reward: config.reward };
    }

    return result;
  }

  /**
   * Process earned reward
   */
  async processReward(reward, context) {
    try {
      console.log('🎁 Processing reward:', reward, 'for:', context);
      
      switch (reward.type) {
        case 'hints':
          // Add hints to user's account
          await this.addHints(reward.amount);
          break;
        
        case 'skip':
          // Allow level skip
          await this.enableLevelSkip();
          break;
        
        case 'time':
          // Add extra time
          await this.addExtraTime(reward.amount);
          break;
        
        case 'score_multiplier':
          // Apply score multiplier
          await this.applyScoreMultiplier(reward.amount);
          break;
        
        case 'ad_free':
          // Enable ad-free period
          await this.enableAdFreeMode(reward.amount);
          break;
        
        default:
          console.warn('⚠️ Unknown reward type:', reward.type);
      }
    } catch (error) {
      console.error('❌ Failed to process reward:', error);
    }
  }

  /**
   * Handle reward earned
   */
  handleRewardEarned(reward) {
    console.log('🎁 Reward earned:', reward);
    // This method is called by the ad event listener
    // The actual reward processing is handled in processReward
  }

  /**
   * Get banner ad component
   */
  getBannerAdComponent() {
    if (!this.shouldShowAds()) {
      return null;
    }

    return {
      adUnitId: this.adUnitIds.banner,
      size: BannerAdSize.ADAPTIVE_BANNER,
      requestOptions: {
        requestNonPersonalizedAdsOnly: false,
      },
    };
  }

  /**
   * Enable/disable ads
   */
  setAdsEnabled(enabled) {
    this.adsEnabled = enabled;
    this.saveAdSettings();
    console.log(`📱 Ads ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set premium status
   */
  setPremiumStatus(isPremium) {
    this.premiumUser = isPremium;
    this.saveAdSettings();
    console.log(`👑 Premium status: ${isPremium ? 'active' : 'inactive'}`);
  }

  /**
   * Check premium status
   */
  async checkPremiumStatus() {
    try {
      const settings = await AsyncStorage.getItem('ballSortAdSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.premiumUser = parsed.premiumUser || false;
      }
    } catch (error) {
      console.warn('⚠️ Failed to check premium status:', error);
    }
  }

  /**
   * Get ad statistics
   */
  getAdStats() {
    return {
      adsEnabled: this.adsEnabled,
      premiumUser: this.premiumUser,
      interstitialLoaded: this.interstitialLoaded,
      rewardedLoaded: this.rewardedLoaded,
      levelCompletions: this.levelCompletions,
      gameStarts: this.gameStarts,
      hintsUsed: this.hintsUsed,
      lastInterstitialShow: this.lastInterstitialShow,
      initialized: this.initialized,
    };
  }

  /**
   * Reset ad counters
   */
  resetAdCounters() {
    this.levelCompletions = 0;
    this.gameStarts = 0;
    this.hintsUsed = 0;
    console.log('🔄 Ad counters reset');
  }

  /**
   * Save ad settings
   */
  async saveAdSettings() {
    try {
      const settings = {
        adsEnabled: this.adsEnabled,
        premiumUser: this.premiumUser,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('ballSortAdSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('⚠️ Failed to save ad settings:', error);
    }
  }

  /**
   * Load ad settings
   */
  async loadAdSettings() {
    try {
      const settings = await AsyncStorage.getItem('ballSortAdSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.adsEnabled = parsed.adsEnabled !== undefined ? parsed.adsEnabled : true;
        this.premiumUser = parsed.premiumUser || false;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load ad settings:', error);
    }
  }

  /**
   * Reward processing helpers
   */
  async addHints(amount) {
    // Implementation depends on your game state management
    console.log(`➕ Adding ${amount} hints`);
  }

  async enableLevelSkip() {
    console.log('⏭️ Level skip enabled');
  }

  async addExtraTime(seconds) {
    console.log(`⏰ Adding ${seconds} seconds`);
  }

  async applyScoreMultiplier(multiplier) {
    console.log(`✨ Score multiplier: ${multiplier}x`);
  }

  async enableAdFreeMode(duration) {
    console.log(`🚫 Ad-free mode enabled for ${duration} seconds`);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.interstitialAd) {
      this.interstitialAd = null;
    }
    if (this.rewardedAd) {
      this.rewardedAd = null;
    }
    this.initialized = false;
    console.log('🧹 AdMob Manager cleaned up');
  }
}

// Create singleton instance
export const AdMobManager = new AdMobManagerClass();

// Export class for testing
export { AdMobManagerClass };