/**
 * Statistics Screen for React Native Ball Sort Puzzle Game
 * Displays comprehensive player statistics and progress tracking
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
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioManager } from '../services/AudioManager';

const { width } = Dimensions.get('window');

const StatisticsScreen = ({ navigation }) => {
  const [statistics, setStatistics] = useState({
    totalLevelsCompleted: 0,
    totalLevelsAttempted: 0,
    totalPlayTime: 0,
    averageTime: 0,
    bestTime: 0,
    totalMoves: 0,
    averageMoves: 0,
    bestMoves: 0,
    perfectLevels: 0,
    hintsUsed: 0,
    undoActionsUsed: 0,
    totalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    gamesPlayed: 0,
    completionRate: 0,
    efficiency: 0,
    lastPlayedDate: null,
    firstPlayDate: null,
    favoriteLevel: 1,
    mostPlayedLevel: 1,
    dailyAverage: 0,
    weeklyProgress: Array(7).fill(0),
    monthlyProgress: Array(30).fill(0),
    levelProgress: {
      easy: { completed: 0, total: 100 },
      medium: { completed: 0, total: 200 },
      hard: { completed: 0, total: 300 },
      expert: { completed: 0, total: 400 },
    },
  });

  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, week, month

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Load comprehensive statistics from AsyncStorage
      const keys = [
        'gameStatistics',
        'levelProgress',
        'playHistory',
        'achievements',
        'userPreferences'
      ];

      const values = await AsyncStorage.multiGet(keys);
      const data = {};
      values.forEach(([key, value]) => {
        data[key] = value ? JSON.parse(value) : null;
      });

      // Calculate comprehensive statistics
      const gameStats = data.gameStatistics || {};
      const levelProg = data.levelProgress || {};
      const playHist = data.playHistory || [];

      const calculatedStats = {
        // Basic completion stats
        totalLevelsCompleted: gameStats.totalLevelsCompleted || 0,
        totalLevelsAttempted: gameStats.totalLevelsAttempted || 0,
        totalPlayTime: gameStats.totalPlayTime || 0,
        
        // Time statistics
        averageTime: gameStats.totalLevelsCompleted > 0 ? 
          Math.round((gameStats.totalPlayTime || 0) / gameStats.totalLevelsCompleted) : 0,
        bestTime: gameStats.bestTime || 0,
        
        // Move statistics
        totalMoves: gameStats.totalMoves || 0,
        averageMoves: gameStats.totalLevelsCompleted > 0 ? 
          Math.round((gameStats.totalMoves || 0) / gameStats.totalLevelsCompleted) : 0,
        bestMoves: gameStats.bestMoves || 0,
        
        // Achievement stats
        perfectLevels: gameStats.perfectLevels || 0,
        hintsUsed: gameStats.hintsUsed || 0,
        undoActionsUsed: gameStats.undoActionsUsed || 0,
        
        // Score and streaks
        totalScore: gameStats.totalScore || 0,
        currentStreak: gameStats.currentStreak || 0,
        longestStreak: gameStats.longestStreak || 0,
        
        // Session stats
        gamesPlayed: playHist.length || 0,
        completionRate: gameStats.totalLevelsAttempted > 0 ? 
          Math.round((gameStats.totalLevelsCompleted / gameStats.totalLevelsAttempted) * 100) : 0,
        
        // Efficiency calculation
        efficiency: gameStats.totalMoves > 0 && gameStats.perfectLevels > 0 ? 
          Math.round((gameStats.perfectLevels / gameStats.totalLevelsCompleted) * 100) : 0,
        
        // Dates
        lastPlayedDate: gameStats.lastPlayedDate ? new Date(gameStats.lastPlayedDate) : null,
        firstPlayDate: gameStats.firstPlayDate ? new Date(gameStats.firstPlayDate) : null,
        
        // Level preferences
        favoriteLevel: gameStats.favoriteLevel || 1,
        mostPlayedLevel: gameStats.mostPlayedLevel || 1,
        
        // Progress tracking
        dailyAverage: calculateDailyAverage(playHist),
        weeklyProgress: calculateWeeklyProgress(playHist),
        monthlyProgress: calculateMonthlyProgress(playHist),
        
        // Level difficulty progress
        levelProgress: {
          easy: { 
            completed: levelProg.easy?.completed || 0, 
            total: 100 
          },
          medium: { 
            completed: levelProg.medium?.completed || 0, 
            total: 200 
          },
          hard: { 
            completed: levelProg.hard?.completed || 0, 
            total: 300 
          },
          expert: { 
            completed: levelProg.expert?.completed || 0, 
            total: 400 
          },
        },
      };

      setStatistics(calculatedStats);
      console.log('📊 Statistics loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      Alert.alert('Error', 'Failed to load statistics data.');
    }
  };

  const calculateDailyAverage = (playHistory) => {
    if (!playHistory || playHistory.length === 0) return 0;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentGames = playHistory.filter(game => {
      const gameDate = new Date(game.date);
      return gameDate >= thirtyDaysAgo;
    });
    
    return Math.round(recentGames.length / 30 * 10) / 10;
  };

  const calculateWeeklyProgress = (playHistory) => {
    const weekProgress = Array(7).fill(0);
    const now = new Date();
    
    if (!playHistory || playHistory.length === 0) return weekProgress;
    
    playHistory.forEach(game => {
      const gameDate = new Date(game.date);
      const daysDiff = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 7) {
        weekProgress[6 - daysDiff] += 1;
      }
    });
    
    return weekProgress;
  };

  const calculateMonthlyProgress = (playHistory) => {
    const monthProgress = Array(30).fill(0);
    const now = new Date();
    
    if (!playHistory || playHistory.length === 0) return monthProgress;
    
    playHistory.forEach(game => {
      const gameDate = new Date(game.date);
      const daysDiff = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 30) {
        monthProgress[29 - daysDiff] += 1;
      }
    });
    
    return monthProgress;
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString();
  };

  const handleResetStatistics = () => {
    AudioManager.playUISound('select');
    
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all statistics? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: resetAllStatistics 
        },
      ]
    );
  };

  const resetAllStatistics = async () => {
    try {
      const keysToReset = [
        'gameStatistics',
        'levelProgress',
        'playHistory'
      ];
      
      await AsyncStorage.multiRemove(keysToReset);
      await loadStatistics();
      
      Alert.alert('Success', 'All statistics have been reset.');
      AudioManager.playUISound('success');
    } catch (error) {
      console.error('❌ Failed to reset statistics:', error);
      Alert.alert('Error', 'Failed to reset statistics.');
    }
  };

  const renderStatCard = (title, value, icon, color, subtitle = null) => {
    return (
      <View style={[styles.statCard, { borderColor: color }]}>
        <LinearGradient
          colors={[`${color}20`, `${color}10`]}
          style={styles.statCardGradient}
        >
          <Icon name={icon} size={24} color={color} />
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </LinearGradient>
      </View>
    );
  };

  const renderProgressBar = (completed, total, color) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {completed}/{total} ({Math.round(percentage)}%)
        </Text>
      </View>
    );
  };

  const renderMiniChart = (data, color) => {
    const maxValue = Math.max(...data, 1);
    const chartWidth = width - 64;
    const barWidth = chartWidth / data.length - 2;
    
    return (
      <View style={styles.miniChart}>
        {data.map((value, index) => (
          <View
            key={index}
            style={[
              styles.chartBar,
              {
                width: barWidth,
                height: Math.max((value / maxValue) * 40, 2),
                backgroundColor: value > 0 ? color : '#E0E0E0',
              }
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetStatistics}>
          <Icon name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Levels Completed', 
              statistics.totalLevelsCompleted.toLocaleString(), 
              'check-circle', 
              '#27AE60'
            )}
            {renderStatCard(
              'Total Play Time', 
              formatTime(statistics.totalPlayTime), 
              'timer', 
              '#3498DB'
            )}
            {renderStatCard(
              'Perfect Levels', 
              statistics.perfectLevels.toLocaleString(), 
              'star', 
              '#F1C40F'
            )}
            {renderStatCard(
              'Total Score', 
              statistics.totalScore.toLocaleString(), 
              'trending-up', 
              '#E74C3C'
            )}
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Completion Rate', 
              `${statistics.completionRate}%`, 
              'pie-chart', 
              '#9B59B6',
              `${statistics.totalLevelsCompleted}/${statistics.totalLevelsAttempted} levels`
            )}
            {renderStatCard(
              'Efficiency', 
              `${statistics.efficiency}%`, 
              'speed', 
              '#E67E22',
              'Perfect level ratio'
            )}
            {renderStatCard(
              'Average Time', 
              formatTime(statistics.averageTime), 
              'av-timer', 
              '#1ABC9C'
            )}
            {renderStatCard(
              'Average Moves', 
              statistics.averageMoves.toLocaleString(), 
              'swap-horiz', 
              '#34495E'
            )}
          </View>
        </View>

        {/* Best Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best Records</Text>
          <View style={styles.recordsContainer}>
            <View style={styles.recordItem}>
              <Icon name="timer" size={20} color="#3498DB" />
              <Text style={styles.recordLabel}>Best Time</Text>
              <Text style={styles.recordValue}>{formatTime(statistics.bestTime)}</Text>
            </View>
            <View style={styles.recordItem}>
              <Icon name="swap-horiz" size={20} color="#E67E22" />
              <Text style={styles.recordLabel}>Fewest Moves</Text>
              <Text style={styles.recordValue}>{statistics.bestMoves}</Text>
            </View>
            <View style={styles.recordItem}>
              <Icon name="whatshot" size={20} color="#E74C3C" />
              <Text style={styles.recordLabel}>Longest Streak</Text>
              <Text style={styles.recordValue}>{statistics.longestStreak}</Text>
            </View>
            <View style={styles.recordItem}>
              <Icon name="trending-up" size={20} color="#27AE60" />
              <Text style={styles.recordLabel}>Current Streak</Text>
              <Text style={styles.recordValue}>{statistics.currentStreak}</Text>
            </View>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level Progress by Difficulty</Text>
          <View style={styles.progressSection}>
            <View style={styles.difficultyProgress}>
              <Text style={styles.difficultyLabel}>Easy (1-100)</Text>
              {renderProgressBar(
                statistics.levelProgress.easy.completed,
                statistics.levelProgress.easy.total,
                '#27AE60'
              )}
            </View>
            <View style={styles.difficultyProgress}>
              <Text style={styles.difficultyLabel}>Medium (101-300)</Text>
              {renderProgressBar(
                statistics.levelProgress.medium.completed,
                statistics.levelProgress.medium.total,
                '#F1C40F'
              )}
            </View>
            <View style={styles.difficultyProgress}>
              <Text style={styles.difficultyLabel}>Hard (301-600)</Text>
              {renderProgressBar(
                statistics.levelProgress.hard.completed,
                statistics.levelProgress.hard.total,
                '#E67E22'
              )}
            </View>
            <View style={styles.difficultyProgress}>
              <Text style={styles.difficultyLabel}>Expert (601-1000)</Text>
              {renderProgressBar(
                statistics.levelProgress.expert.completed,
                statistics.levelProgress.expert.total,
                '#E74C3C'
              )}
            </View>
          </View>
        </View>

        {/* Activity Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Tracking</Text>
          
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Last 7 Days</Text>
            {renderMiniChart(statistics.weeklyProgress, '#3498DB')}
            <View style={styles.chartLabels}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <Text key={day} style={styles.chartLabel}>{day}</Text>
              ))}
            </View>
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Last 30 Days</Text>
            {renderMiniChart(statistics.monthlyProgress, '#27AE60')}
            <Text style={styles.chartSubtext}>
              Daily Average: {statistics.dailyAverage} levels
            </Text>
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>First Play Date</Text>
              <Text style={styles.infoValue}>{formatDate(statistics.firstPlayDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Played</Text>
              <Text style={styles.infoValue}>{formatDate(statistics.lastPlayedDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Games Played</Text>
              <Text style={styles.infoValue}>{statistics.gamesPlayed}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hints Used</Text>
              <Text style={styles.infoValue}>{statistics.hintsUsed}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Undo Actions</Text>
              <Text style={styles.infoValue}>{statistics.undoActionsUsed}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
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
  resetButton: {
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
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 2,
  },
  recordsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recordLabel: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 12,
  },
  recordValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  difficultyProgress: {
    marginBottom: 16,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    minWidth: 80,
    textAlign: 'right',
  },
  chartSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 12,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    marginBottom: 8,
  },
  chartBar: {
    marginRight: 2,
    borderRadius: 1,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  chartLabel: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  chartSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#2C3E50',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
  },
});

export default StatisticsScreen;