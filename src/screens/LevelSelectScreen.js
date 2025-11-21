/**
 * Level Select Screen for React Native Ball Sort Puzzle Game
 * Grid-based level selection with progress indicators
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
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GameEngine } from '../services/GameEngine';
import { AudioManager } from '../services/AudioManager';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_SIZE = (screenWidth - 60) / 5; // 5 items per row with padding

const LevelSelectScreen = ({ navigation, route }) => {
  const { unlockedLevels = 1 } = route.params || {};
  
  const [levelProgress, setLevelProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(0);
  
  const LEVELS_PER_PAGE = 50;
  const TOTAL_LEVELS = 1000;
  const TOTAL_PAGES = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE);

  useFocusEffect(
    useCallback(() => {
      loadLevelProgress();
    }, [])
  );

  const loadLevelProgress = async () => {
    try {
      setIsLoading(true);
      
      const engine = new GameEngine();
      await engine.initialize();
      
      const progress = await engine.getAllLevelProgress();
      setLevelProgress(progress);
      
      // Set initial page based on current progress
      const currentLevel = Math.max(1, Object.keys(progress).length);
      const currentPage = Math.floor((currentLevel - 1) / LEVELS_PER_PAGE);
      setSelectedPage(currentPage);
      
      setIsLoading(false);
      console.log('📊 Level progress loaded:', Object.keys(progress).length, 'levels');
    } catch (error) {
      console.error('❌ Failed to load level progress:', error);
      setIsLoading(false);
    }
  };

  const handleLevelSelect = (level) => {
    if (level > unlockedLevels) {
      AudioManager.playUISound('error');
      Alert.alert('Level Locked', `Complete level ${level - 1} to unlock this level.`);
      return;
    }

    AudioManager.playUISound('select');
    navigation.navigate('GameScreen', { level, resumeGame: false });
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < TOTAL_PAGES) {
      setSelectedPage(page);
      AudioManager.playUISound('select');
    }
  };

  const getLevelStatus = (level) => {
    const progress = levelProgress[level];
    
    if (level > unlockedLevels) {
      return { status: 'locked', stars: 0, completed: false };
    }
    
    if (!progress) {
      return { status: 'available', stars: 0, completed: false };
    }
    
    return {
      status: progress.completed ? 'completed' : 'available',
      stars: progress.stars || 0,
      completed: progress.completed || false,
      bestTime: progress.bestTime,
      bestMoves: progress.bestMoves,
    };
  };

  const renderLevelItem = ({ item: level }) => {
    const levelInfo = getLevelStatus(level);
    
    const getBackgroundColors = () => {
      switch (levelInfo.status) {
        case 'completed':
          return levelInfo.stars === 3 
            ? ['#F1C40F', '#F39C12'] // Gold for 3 stars
            : ['#27AE60', '#2ECC71']; // Green for completed
        case 'available':
          return ['#3498DB', '#5DADE2']; // Blue for available
        case 'locked':
        default:
          return ['#95A5A6', '#BDC3C7']; // Gray for locked
      }
    };

    const renderStars = () => {
      if (levelInfo.status === 'locked') return null;
      
      return (
        <View style={styles.starsContainer}>
          {[1, 2, 3].map(star => (
            <Icon
              key={star}
              name="star"
              size={12}
              color={star <= levelInfo.stars ? '#F1C40F' : 'rgba(255,255,255,0.3)'}
            />
          ))}
        </View>
      );
    };

    const getIcon = () => {
      switch (levelInfo.status) {
        case 'completed':
          return 'check-circle';
        case 'available':
          return 'play-circle-filled';
        case 'locked':
        default:
          return 'lock';
      }
    };

    return (
      <TouchableOpacity
        style={styles.levelItem}
        onPress={() => handleLevelSelect(level)}
        activeOpacity={0.8}
        disabled={levelInfo.status === 'locked'}
      >
        <LinearGradient
          colors={getBackgroundColors()}
          style={styles.levelItemGradient}
        >
          <View style={styles.levelItemContent}>
            <Icon 
              name={getIcon()} 
              size={16} 
              color={levelInfo.status === 'locked' ? '#7F8C8D' : '#FFF'} 
            />
            <Text style={[
              styles.levelNumber,
              levelInfo.status === 'locked' && styles.levelNumberLocked
            ]}>
              {level}
            </Text>
            {renderStars()}
          </View>
          
          {levelInfo.status === 'completed' && (
            <View style={styles.completedBadge}>
              <Icon name="emoji-events" size={10} color="#F1C40F" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderPageSelector = () => {
    const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => i);
    
    return (
      <View style={styles.pageSelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pageSelectorContent}
        >
          {pages.map(page => {
            const startLevel = page * LEVELS_PER_PAGE + 1;
            const endLevel = Math.min((page + 1) * LEVELS_PER_PAGE, TOTAL_LEVELS);
            const isActive = page === selectedPage;
            
            return (
              <TouchableOpacity
                key={page}
                style={[
                  styles.pageButton,
                  isActive && styles.pageButtonActive
                ]}
                onPress={() => handlePageChange(page)}
              >
                <Text style={[
                  styles.pageButtonText,
                  isActive && styles.pageButtonTextActive
                ]}>
                  {startLevel}-{endLevel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const getCurrentPageLevels = () => {
    const startLevel = selectedPage * LEVELS_PER_PAGE + 1;
    const endLevel = Math.min((selectedPage + 1) * LEVELS_PER_PAGE, TOTAL_LEVELS);
    return Array.from({ length: endLevel - startLevel + 1 }, (_, i) => startLevel + i);
  };

  const getProgressStats = () => {
    const completedLevels = Object.values(levelProgress).filter(p => p.completed).length;
    const totalStars = Object.values(levelProgress).reduce((sum, p) => sum + (p.stars || 0), 0);
    const perfectLevels = Object.values(levelProgress).filter(p => p.stars === 3).length;
    
    return { completedLevels, totalStars, perfectLevels };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading levels...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getProgressStats();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Level</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="check-circle" size={20} color="#27AE60" />
          <Text style={styles.statText}>{stats.completedLevels} Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="star" size={20} color="#F1C40F" />
          <Text style={styles.statText}>{stats.totalStars} Stars</Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="emoji-events" size={20} color="#F39C12" />
          <Text style={styles.statText}>{stats.perfectLevels} Perfect</Text>
        </View>
      </View>

      {/* Page Selector */}
      {renderPageSelector()}

      {/* Level Grid */}
      <View style={styles.levelGridContainer}>
        <FlatList
          data={getCurrentPageLevels()}
          renderItem={renderLevelItem}
          keyExtractor={(item) => item.toString()}
          numColumns={5}
          contentContainerStyle={styles.levelGrid}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.levelItemSeparator} />}
        />
      </View>

      {/* Navigation Controls */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            selectedPage === 0 && styles.navButtonDisabled
          ]}
          onPress={() => handlePageChange(selectedPage - 1)}
          disabled={selectedPage === 0}
        >
          <Icon name="chevron-left" size={24} color={selectedPage === 0 ? '#BDC3C7' : '#FFF'} />
          <Text style={[
            styles.navButtonText,
            selectedPage === 0 && styles.navButtonTextDisabled
          ]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>
            Page {selectedPage + 1} of {TOTAL_PAGES}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            selectedPage === TOTAL_PAGES - 1 && styles.navButtonDisabled
          ]}
          onPress={() => handlePageChange(selectedPage + 1)}
          disabled={selectedPage === TOTAL_PAGES - 1}
        >
          <Text style={[
            styles.navButtonText,
            selectedPage === TOTAL_PAGES - 1 && styles.navButtonTextDisabled
          ]}>
            Next
          </Text>
          <Icon name="chevron-right" size={24} color={selectedPage === TOTAL_PAGES - 1 ? '#BDC3C7' : '#FFF'} />
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '600',
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    marginBottom: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  pageSelectorContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    marginBottom: 1,
  },
  pageSelectorContent: {
    paddingHorizontal: 16,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 15,
    backgroundColor: '#ECF0F1',
  },
  pageButtonActive: {
    backgroundColor: '#3498DB',
  },
  pageButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  pageButtonTextActive: {
    color: '#FFF',
  },
  levelGridContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  levelGrid: {
    padding: 20,
  },
  levelItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  levelItemGradient: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  levelNumberLocked: {
    color: '#7F8C8D',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 2,
  },
  levelItemSeparator: {
    height: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navButtonDisabled: {
    backgroundColor: 'transparent',
  },
  navButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#BDC3C7',
  },
  pageIndicator: {
    alignItems: 'center',
  },
  pageIndicatorText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
});

export default LevelSelectScreen;