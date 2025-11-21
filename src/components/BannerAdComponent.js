/**
 * Banner Ad Component for React Native Ball Sort Puzzle Game
 * Displays banner ads at bottom of screens
 */

import React, { memo, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AdMobManager } from '../services/AdMobManager';

const { width: screenWidth } = Dimensions.get('window');

const BannerAdComponent = memo(({ 
  style,
  size = BannerAdSize.ADAPTIVE_BANNER,
  position = 'bottom',
  margin = 10,
  backgroundColor = 'transparent'
}) => {
  const [adConfig, setAdConfig] = useState(null);
  const [adError, setAdError] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Get ad configuration from AdMobManager
    const config = AdMobManager.getBannerAdComponent();
    setAdConfig(config);
  }, []);

  const handleAdLoaded = () => {
    setAdLoaded(true);
    setAdError(false);
    console.log('📱 Banner ad loaded');
  };

  const handleAdError = (error) => {
    setAdError(true);
    setAdLoaded(false);
    console.warn('⚠️ Banner ad error:', error);
  };

  const handleAdOpened = () => {
    console.log('📱 Banner ad opened');
  };

  const handleAdClosed = () => {
    console.log('❌ Banner ad closed');
  };

  const handleAdClicked = () => {
    console.log('👆 Banner ad clicked');
  };

  // Don't render if ads are disabled or config is not available
  if (!adConfig || adError) {
    return null;
  }

  const containerStyle = [
    styles.container,
    {
      backgroundColor,
      margin,
      [position]: 0,
    },
    style,
  ];

  const adStyle = [
    styles.ad,
    {
      width: screenWidth - (margin * 2),
    },
  ];

  return (
    <View style={containerStyle}>
      <BannerAd
        unitId={adConfig.adUnitId}
        size={size}
        requestOptions={adConfig.requestOptions}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdError}
        onAdOpened={handleAdOpened}
        onAdClosed={handleAdClosed}
        onAdClicked={handleAdClicked}
        style={adStyle}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  ad: {
    alignSelf: 'center',
  },
});

BannerAdComponent.displayName = 'BannerAdComponent';

export default BannerAdComponent;