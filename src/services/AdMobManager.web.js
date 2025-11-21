/**
 * Web-compatible AdMob Manager for React Native Web
 * Provides mock ad functionality for browser environment
 */

class AdMobManagerClass {
  constructor() {
    this.initialized = false;
    this.adsEnabled = true;
    this.premiumUser = false;
    this.rewardCallbacks = new Map();
    
    console.log('📱 Web AdMob Manager initialized (Mock Mode)');
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Mock initialization for web
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.initialized = true;
      console.log('📱 Web AdMob system initialized (Mock Mode)');
    } catch (error) {
      console.warn('📱 Web AdMob initialization failed:', error);
      this.initialized = true;
    }
  }

  shouldShowAds() {
    return this.adsEnabled && !this.premiumUser;
  }

  async showInterstitialAd(context = 'general') {
    if (!this.shouldShowAds()) return false;
    
    console.log(`📱 Mock: Showing interstitial ad (${context})`);
    
    // Simulate ad showing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  }

  async showRewardedAd(context = 'general') {
    if (!this.adsEnabled) return false;
    
    console.log(`📱 Mock: Showing rewarded ad (${context})`);
    
    return new Promise((resolve) => {
      // Simulate user watching ad
      setTimeout(() => {
        const reward = {
          type: 'hints',
          amount: 3
        };
        
        console.log('📱 Mock: Rewarded ad completed, granting reward:', reward);
        
        // Simulate reward callback
        if (this.rewardCallbacks.has(context)) {
          this.rewardCallbacks.get(context)(reward);
        }
        
        resolve(reward);
      }, 2000);
    });
  }

  isInterstitialReady() {
    return true; // Always ready in mock mode
  }

  isRewardedReady() {
    return true; // Always ready in mock mode
  }

  setRewardCallback(context, callback) {
    this.rewardCallbacks.set(context, callback);
  }

  getBannerAdComponent() {
    // Return mock banner ad config
    return {
      adUnitId: 'mock-banner-ad-unit',
      size: 'ADAPTIVE_BANNER',
      enabled: this.shouldShowAds()
    };
  }

  onAppResume() {
    console.log('📱 Mock: App resumed - AdMob state updated');
  }

  onAppPause() {
    console.log('📱 Mock: App paused - AdMob state updated');
  }

  setAdsEnabled(enabled) {
    this.adsEnabled = enabled;
    console.log(`📱 Mock: Ads ${enabled ? 'enabled' : 'disabled'}`);
  }

  setPremiumStatus(isPremium) {
    this.premiumUser = isPremium;
    console.log(`📱 Mock: Premium status set to ${isPremium}`);
  }

  async showRewardedAdForBenefit(benefit) {
    console.log(`📱 Mock: Showing rewarded ad for benefit: ${benefit}`);
    return await this.showRewardedAd(benefit);
  }

  onGameEvent(eventType, data = {}) {
    console.log(`📱 Mock: Game event - ${eventType}`, data);
  }

  cleanup() {
    console.log('📱 Cleaning up web AdMob resources (Mock Mode)');
    this.rewardCallbacks.clear();
  }
}

// Create singleton instance
export const AdMobManager = new AdMobManagerClass();

// Export class for testing
export { AdMobManagerClass };