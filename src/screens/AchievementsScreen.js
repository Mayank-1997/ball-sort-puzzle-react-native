/**
 * Achievements Screen for React Native Ball Sort Puzzle Game
 * Displays unlocked achievements and progress
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GooglePlayGamesManager } from '../services/GooglePlayGamesManager';
import { AudioManager } from '../services/AudioManager';

const AchievementsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [achievements, setAchievements] = useState([]);

  // Achievement definitions with local data
  const achievementDefinitions = [
    {
      key: 'first_level',
      title: 'First Steps',
      description: 'Complete your first level',
      icon: 'play-circle-filled',
      iconColor: '#27AE60',
      category: 'Progress',
      difficulty: 'bronze',
    },
    {
      key: 'level_10',
      title: 'Getting Started',
      description: 'Complete 10 levels',
      icon: 'trending-up',
      iconColor: '#3498DB',
      category: 'Progress',
      difficulty: 'bronze',
    },
    {
      key: 'level_50',
      title: 'Dedicated Player',
      description: 'Complete 50 levels',
      icon: 'star',
      iconColor: '#F39C12',
      category: 'Progress',
      difficulty: 'silver',
    },
    {
      key: 'level_100',
      title: 'Centurion',
      description: 'Complete 100 levels',
      icon: 'military-tech',
      iconColor: '#E74C3C',
      category: 'Progress',
      difficulty: 'silver',
    },
    {
      key: 'level_500',
      title: 'Master Player',
      description: 'Complete 500 levels',
      icon: 'emoji-events',
      iconColor: '#9B59B6',
      category: 'Progress',
      difficulty: 'gold',
    },
    {
      key: 'perfect_level',
      title: 'Perfectionist',
      description: 'Complete a level with minimum moves',
      icon: 'stars',
      iconColor: '#F1C40F',
      category: 'Skill',
      difficulty: 'silver',
    },
    {
      key: 'speed_demon',
      title: 'Speed Demon',
      description: 'Complete a level in under 30 seconds',
      icon: 'timer',
      iconColor: '#E67E22',
      category: 'Skill',
      difficulty: 'silver',
    },
    {
      key: 'efficient_player',
      title: 'Efficiency Expert',
      description: 'Complete 10 levels with minimum moves',
      icon: 'trending-up',
      iconColor: '#27AE60',
      category: 'Skill',
      difficulty: 'gold',
    },
    {
      key: 'no_hints',
      title: 'Independent Thinker',
      description: 'Complete 5 levels without using hints',
      icon: 'psychology',
      iconColor: '#9C27B0',
      category: 'Skill',
      difficulty: 'silver',
    },
    {
      key: 'comeback_king',
      title: 'Never Give Up',
      description: 'Complete a level after using undo 10+ times',
      icon: 'restart-alt',
      iconColor: '#FF5722',
      category: 'Persistence',
      difficulty: 'bronze',
    },
    {
      key: 'master_solver',
      title: 'Master Solver',
      description: 'Complete 25 levels in a row',
      icon: 'auto-awesome',
      iconColor: '#673AB7',
      category: 'Skill',
      difficulty: 'gold',
    },
    {
      key: 'daily_player',
      title: 'Daily Dedication',
      description: 'Play for 7 consecutive days',
      icon: 'event',
      iconColor: '#4CAF50',
      category: 'Dedication',
      difficulty: 'silver',
    },
    {
      key: 'dedicated_player',
      title: 'True Dedication',
      description: 'Play for 30 consecutive days',
      icon: 'event-available',
      iconColor: '#2196F3',
      category: 'Dedication',
      difficulty: 'gold',
    },
    {
      key: 'ball_master',
      title: 'Ball Sort Master',
      description: 'Complete all 1000 levels',
      icon: 'workspace-premium',
      iconColor: '#FFD700',
      category: 'Ultimate',
      difficulty: 'platinum',
    },
  ];

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      
      // Check Google Play Games sign-in status
      const playerInfo = GooglePlayGamesManager.getPlayerInfo();
      setIsSignedIn(playerInfo.isSignedIn);
      
      // Load local achievement progress
      const localAchievements = await loadLocalAchievements();
      
      // Merge with definitions
      const mergedAchievements = achievementDefinitions.map(def => ({
        ...def,
        unlocked: localAchievements[def.key]?.unlocked || false,
        unlockedDate: localAchievements[def.key]?.unlockedDate || null,
        progress: localAchievements[def.key]?.progress || 0,
      }));
      
      setAchievements(mergedAchievements);
      console.log('🏆 Achievements loaded:', mergedAchievements.length);
    } catch (error) {
      console.error('❌ Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalAchievements = async () => {
    try {
      // This would load from AsyncStorage or GameEngine
      // For now, return mock data
      return {
        first_level: { unlocked: true, unlockedDate: new Date('2023-01-15') },
        level_10: { unlocked: true, unlockedDate: new Date('2023-01-20') },
        perfect_level: { unlocked: true, unlockedDate: new Date('2023-01-18') },
        speed_demon: { unlocked: false, progress: 0.6 },
        level_50: { unlocked: false, progress: 0.3 },
      };
    } catch (error) {
      console.error('❌ Failed to load local achievements:', error);
      return {};
    }
  };

  const handleSignIn = async () => {
    AudioManager.playUISound('select');
    
    try {
      const result = await GooglePlayGamesManager.signIn();
      if (result.success) {
        setIsSignedIn(true);
        Alert.alert('Success', `Welcome, ${result.player.name}!`);
        // Reload achievements to sync with Google Play
        loadAchievements();
      } else {
        Alert.alert('Sign In Failed', 'Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in to Google Play Games.');
    }
  };

  const handleShowGooglePlayAchievements = async () => {
    AudioManager.playUISound('select');
    
    if (!isSignedIn) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to Google Play Games to view online achievements.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: handleSignIn },
        ]
      );
      return;
    }

    const success = await GooglePlayGamesManager.showAchievements();
    if (!success) {
      Alert.alert('Error', 'Failed to show Google Play achievements.');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#BDC3C7';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const renderAchievement = (achievement, index) => {
    const isUnlocked = achievement.unlocked;
    const progress = achievement.progress || 0;
    
    return (
      <View key={achievement.key} style={styles.achievementItem}>
        <LinearGradient
          colors={isUnlocked ? 
            ['#F8F9FA', '#E9ECEF'] : 
            ['#F8F9FA', '#F8F9FA']
          }
          style={styles.achievementGradient}
        >
          {/* Achievement Icon */}
          <View style={[
            styles.achievementIcon,
            { backgroundColor: isUnlocked ? achievement.iconColor : '#BDC3C7' }
          ]}>
            <Icon 
              name={achievement.icon} 
              size={32} 
              color={isUnlocked ? '#FFF' : '#7F8C8D'} 
            />
          </View>

          {/* Achievement Content */}
          <View style={styles.achievementContent}>
            <View style={styles.achievementHeader}>
              <Text style={[
                styles.achievementTitle,
                !isUnlocked && styles.achievementTitleLocked
              ]}>
                {achievement.title}
              </Text>
              
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(achievement.difficulty) }
              ]}>
                <Text style={styles.difficultyText}>
                  {achievement.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={[
              styles.achievementDescription,
              !isUnlocked && styles.achievementDescriptionLocked
            ]}>
              {achievement.description}
            </Text>
            
            <View style={styles.achievementFooter}>
              <Text style={styles.categoryText}>{achievement.category}</Text>
              
              {isUnlocked ? (
                <Text style={styles.unlockedDate}>
                  Unlocked {formatDate(achievement.unlockedDate)}
                </Text>
              ) : progress > 0 ? (
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}% Complete
                </Text>
              ) : null}
            </View>
            
            {!isUnlocked && progress > 0 && (
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%` }
                  ]} 
                />
              </View>
            )}
          </View>

          {/* Unlocked Indicator */}
          {isUnlocked && (
            <View style={styles.unlockedIndicator}>
              <Icon name="check-circle" size={24} color="#27AE60" />
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const getStats = () => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const unlockedPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    
    return { unlockedCount, totalCount, unlockedPercentage };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <TouchableOpacity 
          style={styles.googlePlayButton} 
          onPress={handleShowGooglePlayAchievements}
        >
          <Icon name="videogame-asset" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.unlockedPercentage}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>

      {/* Google Play Sign In Banner */}
      {!isSignedIn && (
        <TouchableOpacity style={styles.signInBanner} onPress={handleSignIn}>
          <Icon name="cloud" size={24} color="#3498DB" />
          <View style={styles.signInContent}>
            <Text style={styles.signInTitle}>Sign in to Google Play</Text>
            <Text style={styles.signInDescription}>
              Sync achievements and compete with friends
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#3498DB" />
        </TouchableOpacity>
      )}

      {/* Achievements List */}
      <ScrollView 
        style={styles.achievementsList}
        showsVerticalScrollIndicator={false}
      >
        {achievements.map(renderAchievement)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#2C3E50',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  googlePlayButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 20,
    marginBottom: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  signInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 1,
    borderTopWidth: 1,
    borderTopColor: '#3498DB',
  },
  signInContent: {
    flex: 1,
    marginLeft: 12,
  },
  signInTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  signInDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  achievementsList: {
    flex: 1,
  },
  achievementItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  achievementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  achievementTitleLocked: {
    color: '#95A5A6',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 8,
  },
  achievementDescriptionLocked: {
    color: '#BDC3C7',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
  unlockedDate: {
    fontSize: 12,
    color: '#27AE60',
    fontStyle: 'italic',
  },
  progressText: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ECF0F1',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498DB',
  },
  unlockedIndicator: {
    marginLeft: 8,
  },
});

export default AchievementsScreen;