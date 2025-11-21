/**
 * Rewarded Ad Modal Component for React Native Ball Sort Puzzle Game
 * Shows reward options and handles rewarded ad playback
 */

import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { AdMobManager } from '../services/AdMobManager';
import { AudioManager } from '../services/AudioManager';

const RewardedAdModal = memo(({
  visible,
  onClose,
  onRewardEarned,
  rewardType = 'extra_hints',
  customTitle,
  customDescription,
  customReward,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [adAvailable, setAdAvailable] = useState(false);

  // Reward configurations
  const rewardConfigs = {
    'extra_hints': {
      title: 'Get Extra Hints',
      description: 'Watch a short video ad to earn 3 extra hints for this level.',
      icon: 'lightbulb-outline',
      iconColor: '#F39C12',
      reward: '3 Hints',
      gradientColors: ['#F39C12', '#E67E22'],
    },
    'skip_level': {
      title: 'Skip Level',
      description: 'Watch a video ad to skip this challenging level and move to the next one.',
      icon: 'skip-next',
      iconColor: '#3498DB',
      reward: 'Level Skip',
      gradientColors: ['#3498DB', '#2980B9'],
    },
    'extra_time': {
      title: 'Extra Time',
      description: 'Watch an ad to add 60 seconds to your timer.',
      icon: 'timer',
      iconColor: '#27AE60',
      reward: '+60 Seconds',
      gradientColors: ['#27AE60', '#229954'],
    },
    'double_score': {
      title: 'Double Score',
      description: 'Watch an ad to double your score for this level completion.',
      icon: 'star',
      iconColor: '#F1C40F',
      reward: '2x Score',
      gradientColors: ['#F1C40F', '#F39C12'],
    },
    'remove_ads': {
      title: 'Ad-Free Gaming',
      description: 'Watch an ad to enjoy 1 hour of ad-free gameplay.',
      icon: 'block',
      iconColor: '#E74C3C',
      reward: '1 Hour Ad-Free',
      gradientColors: ['#E74C3C', '#C0392B'],
    },
  };

  const config = customTitle ? {
    title: customTitle,
    description: customDescription || 'Watch an ad to earn a reward.',
    icon: 'card-giftcard',
    iconColor: '#9B59B6',
    reward: customReward || 'Reward',
    gradientColors: ['#9B59B6', '#8E44AD'],
  } : rewardConfigs[rewardType] || rewardConfigs['extra_hints'];

  useEffect(() => {
    if (visible) {
      checkAdAvailability();
    }
  }, [visible]);

  const checkAdAvailability = () => {
    const available = AdMobManager.isRewardedReady();
    setAdAvailable(available);
    
    if (!available) {
      console.log('🚫 Rewarded ad not available');
    }
  };

  const handleWatchAd = async () => {
    if (!adAvailable) {
      Alert.alert(
        'Ad Not Available',
        'No ads are available right now. Please try again later.',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }

    setIsLoading(true);
    AudioManager.playUISound('select');

    try {
      const result = await AdMobManager.showRewardedAdForBenefit(rewardType);
      
      if (result.success && result.rewardEarned) {
        // Reward was earned
        AudioManager.playUISound('victory');
        
        if (onRewardEarned) {
          onRewardEarned(result.reward);
        }
        
        Alert.alert(
          'Reward Earned! 🎉',
          `You have successfully earned: ${config.reward}`,
          [{ text: 'Awesome!', onPress: onClose }]
        );
      } else if (result.success && !result.rewardEarned) {
        // Ad was shown but reward not earned (user closed early)
        AudioManager.playUISound('error');
        Alert.alert(
          'Reward Not Earned',
          'You need to watch the complete ad to earn the reward.',
          [{ text: 'Try Again', onPress: () => setIsLoading(false) }, { text: 'Cancel', onPress: onClose }]
        );
      } else {
        // Ad failed to show
        AudioManager.playUISound('error');
        Alert.alert(
          'Ad Failed',
          'Sorry, we couldn\'t show the ad right now. Please try again later.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      console.error('❌ Rewarded ad error:', error);
      AudioManager.playUISound('error');
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      AudioManager.playUISound('deselect');
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <LinearGradient
            colors={config.gradientColors}
            style={styles.header}
          >
            <Icon name={config.icon} size={40} color="#FFF" />
            <Text style={styles.title}>{config.title}</Text>
          </LinearGradient>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>{config.description}</Text>
            
            <View style={styles.rewardContainer}>
              <Icon name="card-giftcard" size={24} color={config.iconColor} />
              <Text style={styles.rewardText}>You will earn: {config.reward}</Text>
            </View>

            {!adAvailable && (
              <View style={styles.notAvailableContainer}>
                <Icon name="info" size={20} color="#E67E22" />
                <Text style={styles.notAvailableText}>
                  Ad not available right now. Please try again later.
                </Text>
              </View>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.watchButton,
                (!adAvailable || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleWatchAd}
              disabled={!adAvailable || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Icon name="play-circle-filled" size={20} color="#FFF" />
                  <Text style={styles.watchButtonText}>Watch Ad</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 Ads help us keep the game free and create more levels!
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 300,
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  notAvailableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F4D03F',
  },
  notAvailableText: {
    fontSize: 14,
    color: '#B7950B',
    marginLeft: 8,
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#BDC3C7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  watchButton: {
    backgroundColor: '#27AE60',
    flexDirection: 'row',
  },
  watchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  buttonDisabled: {
    backgroundColor: '#95A5A6',
  },
  footer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

RewardedAdModal.displayName = 'RewardedAdModal';

export default RewardedAdModal;