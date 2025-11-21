/**
 * Leaderboard Screen for React Native Ball Sort Puzzle Game
 * Displays global leaderboards and player rankings
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
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GooglePlayGamesManager } from '../services/GooglePlayGamesManager';
import { AudioManager } from '../services/AudioManager';

const LeaderboardScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('total_levels');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [playerRank, setPlayerRank] = useState(null);

  // Leaderboard configurations
  const leaderboards = [
    {
      key: 'total_levels',
      title: 'Total Levels',
      description: 'Most levels completed',
      icon: 'trending-up',
      iconColor: '#3498DB',
      unit: 'levels',
    },
    {
      key: 'best_time',
      title: 'Best Time',
      description: 'Fastest level completion',
      icon: 'timer',
      iconColor: '#E67E22',
      unit: 'seconds',
      isTime: true,
    },
    {
      key: 'total_score',
      title: 'Total Score',
      description: 'Highest total score',
      icon: 'star',
      iconColor: '#F1C40F',
      unit: 'points',
    },
    {
      key: 'perfect_levels',
      title: 'Perfect Levels',
      description: 'Most perfect completions',
      icon: 'stars',
      iconColor: '#9B59B6',
      unit: 'levels',
    },
    {
      key: 'weekly_levels',
      title: 'This Week',
      description: 'Levels completed this week',
      icon: 'event',
      iconColor: '#27AE60',
      unit: 'levels',
    },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedLeaderboard]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      
      // Check Google Play Games sign-in status
      const playerInfo = GooglePlayGamesManager.getPlayerInfo();
      setIsSignedIn(playerInfo.isSignedIn);
      
      if (playerInfo.isSignedIn) {
        // Load actual leaderboard data from Google Play
        // This would be implemented with actual API calls
        const mockData = generateMockLeaderboardData();
        setLeaderboardData(mockData.leaderboard);
        setPlayerRank(mockData.playerRank);
      } else {
        // Load local/demo data
        const mockData = generateMockLeaderboardData();
        setLeaderboardData(mockData.leaderboard);
        setPlayerRank(null);
      }
      
      console.log('📊 Leaderboard loaded:', selectedLeaderboard);
    } catch (error) {
      console.error('❌ Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockLeaderboardData = () => {
    const names = [
      'Alex Champion', 'Jordan Swift', 'Casey Pro', 'Riley Master',
      'Quinn Legend', 'Taylor Elite', 'Morgan Star', 'Cameron Ace',
      'Drew Winner', 'Sage Expert', 'Player123', 'BallSortKing',
      'PuzzleMaster', 'LevelHero', 'SortGenius'
    ];

    const selectedConfig = leaderboards.find(l => l.key === selectedLeaderboard);
    
    const leaderboard = names.slice(0, 10).map((name, index) => {
      let score;
      switch (selectedLeaderboard) {
        case 'best_time':
          score = 15 + index * 5 + Math.random() * 10; // Time in seconds
          break;
        case 'total_score':
          score = (1000 - index * 50) * 100 + Math.random() * 5000;
          break;
        case 'perfect_levels':
          score = 50 - index * 3 + Math.random() * 5;
          break;
        case 'weekly_levels':
          score = 25 - index * 2 + Math.random() * 3;
          break;
        default: // total_levels
          score = 500 - index * 25 + Math.random() * 20;
      }

      return {
        rank: index + 1,
        name: name,
        score: Math.floor(score),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        isPlayer: name === 'You' && index === 3, // Mock player position
      };
    });

    // Add player rank if signed in
    const playerRank = isSignedIn ? {
      rank: 47,
      name: 'You',
      score: 234,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player',
      isPlayer: true,
    } : null;

    return { leaderboard, playerRank };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
  };

  const handleLeaderboardChange = (leaderboardKey) => {
    if (leaderboardKey !== selectedLeaderboard) {
      setSelectedLeaderboard(leaderboardKey);
      AudioManager.playUISound('select');
    }
  };

  const handleSignIn = async () => {
    AudioManager.playUISound('select');
    
    try {
      const result = await GooglePlayGamesManager.signIn();
      if (result.success) {
        setIsSignedIn(true);
        Alert.alert('Success', `Welcome, ${result.player.name}!`);
        await loadLeaderboard();
      } else {
        Alert.alert('Sign In Failed', 'Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in to Google Play Games.');
    }
  };

  const handleShowGooglePlayLeaderboard = async () => {
    AudioManager.playUISound('select');
    
    if (!isSignedIn) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to Google Play Games to view online leaderboards.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: handleSignIn },
        ]
      );
      return;
    }

    const success = await GooglePlayGamesManager.showLeaderboard(selectedLeaderboard);
    if (!success) {
      Alert.alert('Error', 'Failed to show Google Play leaderboard.');
    }
  };

  const formatScore = (score, leaderboardKey) => {
    const config = leaderboards.find(l => l.key === leaderboardKey);
    
    if (config?.isTime) {
      const minutes = Math.floor(score / 60);
      const seconds = Math.floor(score % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    } else if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    
    return score.toLocaleString();
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return { icon: 'workspace-premium', color: '#FFD700' };
      case 2: return { icon: 'workspace-premium', color: '#C0C0C0' };
      case 3: return { icon: 'workspace-premium', color: '#CD7F32' };
      default: return { icon: 'person', color: '#95A5A6' };
    }
  };

  const renderLeaderboardTab = (leaderboard) => {
    const isSelected = selectedLeaderboard === leaderboard.key;
    
    return (
      <TouchableOpacity
        key={leaderboard.key}
        style={[
          styles.leaderboardTab,
          isSelected && styles.leaderboardTabActive
        ]}
        onPress={() => handleLeaderboardChange(leaderboard.key)}
      >
        <Icon 
          name={leaderboard.icon} 
          size={20} 
          color={isSelected ? '#FFF' : leaderboard.iconColor} 
        />
        <Text style={[
          styles.leaderboardTabText,
          isSelected && styles.leaderboardTabTextActive
        ]}>
          {leaderboard.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderLeaderboardEntry = (entry, index) => {
    const rankInfo = getRankIcon(entry.rank);
    
    return (
      <View key={`${entry.rank}-${entry.name}`} style={[
        styles.leaderboardEntry,
        entry.isPlayer && styles.playerEntry
      ]}>
        <View style={styles.rankContainer}>
          <Icon 
            name={rankInfo.icon} 
            size={24} 
            color={rankInfo.color} 
          />
          <Text style={[
            styles.rankText,
            entry.isPlayer && styles.playerText
          ]}>
            #{entry.rank}
          </Text>
        </View>
        
        <View style={styles.playerInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={20} color="#FFF" />
          </View>
          <Text style={[
            styles.playerName,
            entry.isPlayer && styles.playerText
          ]}>
            {entry.name}
          </Text>
        </View>
        
        <Text style={[
          styles.scoreText,
          entry.isPlayer && styles.playerText
        ]}>
          {formatScore(entry.score, selectedLeaderboard)}
        </Text>
      </View>
    );
  };

  const selectedConfig = leaderboards.find(l => l.key === selectedLeaderboard);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboards</Text>
        <TouchableOpacity 
          style={styles.googlePlayButton} 
          onPress={handleShowGooglePlayLeaderboard}
        >
          <Icon name="videogame-asset" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Leaderboard Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {leaderboards.map(renderLeaderboardTab)}
      </ScrollView>

      {/* Selected Leaderboard Info */}
      <View style={styles.leaderboardInfo}>
        <LinearGradient
          colors={[selectedConfig.iconColor, `${selectedConfig.iconColor}80`]}
          style={styles.leaderboardInfoGradient}
        >
          <Icon name={selectedConfig.icon} size={32} color="#FFF" />
          <View style={styles.leaderboardInfoText}>
            <Text style={styles.leaderboardTitle}>{selectedConfig.title}</Text>
            <Text style={styles.leaderboardDescription}>{selectedConfig.description}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Google Play Sign In Banner */}
      {!isSignedIn && (
        <TouchableOpacity style={styles.signInBanner} onPress={handleSignIn}>
          <Icon name="cloud" size={24} color="#3498DB" />
          <View style={styles.signInContent}>
            <Text style={styles.signInTitle}>Sign in to compete globally</Text>
            <Text style={styles.signInDescription}>
              Compare your scores with players worldwide
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#3498DB" />
        </TouchableOpacity>
      )}

      {/* Player Rank (if signed in and not in top 10) */}
      {isSignedIn && playerRank && playerRank.rank > 10 && (
        <View style={styles.playerRankContainer}>
          <Text style={styles.playerRankTitle}>Your Rank</Text>
          {renderLeaderboardEntry(playerRank)}
        </View>
      )}

      {/* Leaderboard List */}
      <ScrollView 
        style={styles.leaderboardList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3498DB']}
            tintColor="#3498DB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {leaderboardData.map(renderLeaderboardEntry)}
        
        {leaderboardData.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="leaderboard" size={64} color="#BDC3C7" />
            <Text style={styles.emptyStateTitle}>No Data Available</Text>
            <Text style={styles.emptyStateText}>
              {isSignedIn ? 
                'Leaderboard data is being loaded...' : 
                'Sign in to view global leaderboards'
              }
            </Text>
          </View>
        )}
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
  tabsContainer: {
    backgroundColor: '#FFF',
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leaderboardTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  leaderboardTabActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  leaderboardTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginLeft: 6,
  },
  leaderboardTabTextActive: {
    color: '#FFF',
  },
  leaderboardInfo: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  leaderboardInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leaderboardInfoText: {
    marginLeft: 16,
    flex: 1,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  leaderboardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  signInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3498DB',
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
  playerRankContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  playerRankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  leaderboardList: {
    flex: 1,
    marginTop: 16,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
  playerEntry: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  rankContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 2,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#95A5A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    flex: 1,
  },
  playerText: {
    color: '#27AE60',
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    minWidth: 60,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
  },
});

export default LeaderboardScreen;