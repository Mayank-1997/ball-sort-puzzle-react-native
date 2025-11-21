/**
 * Menu Screen for React Native Ball Sort Puzzle Game
 * Main menu with level selection, settings, and game options
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ImageBackground,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import BannerAdComponent from '../components/BannerAdComponent';
import { GameEngine } from '../utils/GameEngine';
import { AudioManager } from '../services/AudioManager';
import { AdMobManager } from '../services/AdMobManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MenuScreen = ({ navigation }) => {
  const [gameProgress, setGameProgress] = useState({
    currentLevel: 1,
    unlockedLevels: 1,
    totalStars: 0,
    hasResumeGame: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Focus effect to refresh data when screen becomes active
  useFocusEffect(
    useCallback(() => {
      loadGameProgress();
    }, [])
  );

  const loadGameProgress = async () => {
    try {
      setIsLoading(true);
      
      // Create temporary game engine to load progress
      const engine = new GameEngine();
      await engine.initialize();
      
      const progress = await engine.getProgress();
      const hasResume = await engine.hasSavedGame();
      
      setGameProgress({
        currentLevel: progress.currentLevel || 1,
        unlockedLevels: progress.unlockedLevels || 1,
        totalStars: progress.totalStars || 0,
        hasResumeGame: hasResume,
      });
      
      setIsLoading(false);
      console.log('📊 Game progress loaded:', progress);
    } catch (error) {
      console.error('❌ Failed to load game progress:', error);
      setIsLoading(false);
    }
  };

  const handleStartNewGame = () => {
    AudioManager.playUISound('select');
    AdMobManager.onGameEvent('game_started', { level: 1 });
    navigation.navigate('GameScreen', { level: 1, resumeGame: false });
  };

  const handleResumeGame = () => {
    AudioManager.playUISound('select');
    navigation.navigate('GameScreen', { 
      level: gameProgress.currentLevel, 
      resumeGame: true 
    });
  };

  const handleLevelSelect = () => {
    AudioManager.playUISound('select');
    navigation.navigate('LevelSelectScreen', { 
      unlockedLevels: gameProgress.unlockedLevels 
    });
  };

  const handleSettings = () => {
    AudioManager.playUISound('select');
    navigation.navigate('SettingsScreen');
  };

  const handleAchievements = () => {
    AudioManager.playUISound('select');
    // TODO: Navigate to achievements screen
    Alert.alert('Coming Soon', 'Achievements screen will be available in a future update.');
  };

  const handleLeaderboard = () => {
    AudioManager.playUISound('select');
    // TODO: Navigate to leaderboard screen
    Alert.alert('Coming Soon', 'Leaderboard will be available in a future update.');
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all game progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const engine = new GameEngine();
              await engine.initialize();
              await engine.resetProgress();
              await loadGameProgress();
              AudioManager.playUISound('select');
              Alert.alert('Success', 'Game progress has been reset.');
            } catch (error) {
              console.error('Failed to reset progress:', error);
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    AudioManager.playUISound('select');
    // TODO: Open app store rating
    Alert.alert('Rate App', 'Thank you for your interest! This feature will open the app store rating.');
  };

  const handleShareApp = () => {
    AudioManager.playUISound('select');
    // TODO: Open share dialog
    Alert.alert('Share App', 'Share feature will be available soon!');
  };

  const renderLoadingScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return renderLoadingScreen();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      <LinearGradient
        colors={['#2C3E50', '#3498DB', '#2C3E50']}
        style={styles.background}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Game Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.gameTitle}>Ball Sort</Text>
            <Text style={styles.gameSubtitle}>Puzzle</Text>
            <View style={styles.titleDecorator}>
              <View style={styles.decoratorBall} />
              <View style={[styles.decoratorBall, { backgroundColor: '#E74C3C' }]} />
              <View style={[styles.decoratorBall, { backgroundColor: '#F39C12' }]} />
              <View style={[styles.decoratorBall, { backgroundColor: '#27AE60' }]} />
            </View>
          </View>

          {/* Progress Stats */}
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Icon name="emoji-events" size={24} color="#F1C40F" />
              <Text style={styles.progressText}>Level {gameProgress.currentLevel}</Text>
            </View>
            
            <View style={styles.progressItem}>
              <Icon name="star" size={24} color="#F1C40F" />
              <Text style={styles.progressText}>{gameProgress.totalStars} Stars</Text>
            </View>
            
            <View style={styles.progressItem}>
              <Icon name="lock-open" size={24} color="#27AE60" />
              <Text style={styles.progressText}>{gameProgress.unlockedLevels} Unlocked</Text>
            </View>
          </View>

          {/* Main Menu Buttons */}
          <View style={styles.menuContainer}>
            {gameProgress.hasResumeGame && (
              <TouchableOpacity style={[styles.menuButton, styles.resumeButton]} onPress={handleResumeGame}>
                <LinearGradient colors={['#27AE60', '#2ECC71']} style={styles.buttonGradient}>
                  <Icon name="play-arrow" size={28} color="#FFF" />
                  <Text style={styles.menuButtonText}>Resume Game</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.menuButton} onPress={handleStartNewGame}>
              <LinearGradient colors={['#3498DB', '#5DADE2']} style={styles.buttonGradient}>
                <Icon name="add" size={28} color="#FFF" />
                <Text style={styles.menuButtonText}>New Game</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuButton} onPress={handleLevelSelect}>
              <LinearGradient colors={['#9B59B6', '#BB8FCE']} style={styles.buttonGradient}>
                <Icon name="grid-view" size={28} color="#FFF" />
                <Text style={styles.menuButtonText}>Select Level</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuButton} onPress={handleSettings}>
              <LinearGradient colors={['#34495E', '#5D6D7E']} style={styles.buttonGradient}>
                <Icon name="settings" size={28} color="#FFF" />
                <Text style={styles.menuButtonText}>Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Secondary Menu Buttons */}
          <View style={styles.secondaryMenuContainer}>
            <View style={styles.secondaryMenuRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleAchievements}>
                <Icon name="emoji-events" size={24} color="#F1C40F" />
                <Text style={styles.secondaryButtonText}>Achievements</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleLeaderboard}>
                <Icon name="leaderboard" size={24} color="#3498DB" />
                <Text style={styles.secondaryButtonText}>Leaderboard</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.secondaryMenuRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleRateApp}>
                <Icon name="star-rate" size={24} color="#E67E22" />
                <Text style={styles.secondaryButtonText}>Rate App</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleShareApp}>
                <Icon name="share" size={24} color="#27AE60" />
                <Text style={styles.secondaryButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleResetProgress}
              onLongPress={() => {
                Alert.alert('Reset Progress', 'Long press confirmed. Tap to reset all progress.');
              }}
            >
              <Text style={styles.resetButtonText}>Reset Progress</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>

        {/* Banner Ad */}
        <BannerAdComponent position="bottom" />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gameSubtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ECF0F1',
    textAlign: 'center',
    marginTop: -5,
  },
  titleDecorator: {
    flexDirection: 'row',
    marginTop: 15,
  },
  decoratorBall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3498DB',
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuButton: {
    marginVertical: 8,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resumeButton: {
    marginBottom: 15,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  menuButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryMenuContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  secondaryMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  secondaryButton: {
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.5)',
    marginBottom: 15,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});

export default MenuScreen;