/**
 * Game Screen for React Native Ball Sort Puzzle Game
 * Main game interface with board, UI controls, and game state display
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GameBoard from '../components/GameBoard';
import ParticleSystem, { useParticleSystem } from '../components/ParticleSystem';
import BannerAdComponent from '../components/BannerAdComponent';
import RewardedAdModal from '../components/RewardedAdModal';
import { GameEngine } from '../utils/GameEngine';
import { AudioManager } from '../services/AudioManager';
import { AdMobManager } from '../services/AdMobManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen = ({ navigation, route }) => {
  const { level = 1, resumeGame = false } = route.params || {};
  
  // Game state
  const [gameEngine, setGameEngine] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [showRewardedModal, setShowRewardedModal] = useState(false);
  const [rewardType, setRewardType] = useState('extra_hints');

  // Particle system
  const particleSystem = useParticleSystem();

  // Refs
  const gameEngineRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize game engine
  useEffect(() => {
    initializeGame();
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.cleanup();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [level]);

  // Handle screen focus
  useFocusEffect(
    useCallback(() => {
      if (gameEngine && !isPaused) {
        startTimer();
      }
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [gameEngine, isPaused])
  );

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      
      // Create new game engine instance
      const engine = new GameEngine();
      await engine.initialize();
      
      // Load or start level
      if (resumeGame) {
        await engine.loadGame();
      } else {
        await engine.startLevel(level);
      }
      
      // Set up event listeners
      setupGameEngineListeners(engine);
      
      setGameEngine(engine);
      gameEngineRef.current = engine;
      
      // Get initial game state
      const initialState = engine.getGameState();
      setGameState(initialState);
      setMoves(initialState.moves || 0);
      setScore(initialState.score || 0);
      setTimer(initialState.timeElapsed || 0);
      
      setIsLoading(false);
      
      // Start timer
      if (!isPaused) {
        startTimer();
      }
      
      console.log(`🎮 Game initialized - Level ${level}`);
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
      navigation.goBack();
    }
  };

  const setupGameEngineListeners = (engine) => {
    engine.addEventListener('stateChanged', handleGameStateChange);
    engine.addEventListener('moveCompleted', handleMoveCompleted);
    engine.addEventListener('moveError', handleMoveError);
    engine.addEventListener('levelCompleted', handleLevelCompleted);
    engine.addEventListener('timeUpdated', handleTimeUpdated);
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      if (!isPaused && gameEngine) {
        setTimer(prev => prev + 1);
        gameEngine.updateTime(1);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Event handlers
  const handleGameStateChange = (newState) => {
    setGameState(newState);
    setMoves(newState.moves || 0);
    setScore(newState.score || 0);
  };

  const handleMoveCompleted = (event) => {
    const { fromTube, toTube, ballColor, position } = event;
    
    // Create success particle effect
    if (position) {
      particleSystem.createSuccessEffect(position.x, position.y, ballColor);
    }
    
    AudioManager.playUISound('success');
  };

  const handleMoveError = (event) => {
    const { reason, position } = event;
    
    // Create error particle effect
    if (position) {
      particleSystem.createErrorEffect(position.x, position.y);
    }
    
    AudioManager.playUISound('error');
  };

  const handleLevelCompleted = (event) => {
    const { level, moves, time, score, isNewRecord } = event;
    
    stopTimer();
    
    // Create victory particle effect
    particleSystem.createVictoryEffect();
    
    // Notify AdMob of level completion
    AdMobManager.onGameEvent('level_completed', { level, moves, time, score });
    
    // Show victory modal
    setTimeout(() => {
      setShowVictoryModal(true);
    }, 1000);
    
    AudioManager.playSoundSequence(['victory', 'congratulations'], 800);
    
    console.log('🎉 Level completed:', { level, moves, time, score, isNewRecord });
  };

  const handleTimeUpdated = (event) => {
    setTimer(event.timeElapsed);
  };

  // UI Actions
  const handlePause = () => {
    setPaused(true);
    setShowPauseMenu(true);
    stopTimer();
    AudioManager.playUISound('select');
  };

  const handleResume = () => {
    setPaused(false);
    setShowPauseMenu(false);
    startTimer();
    AudioManager.playUISound('select');
  };

  const handleRestart = () => {
    Alert.alert(
      'Restart Level',
      'Are you sure you want to restart this level? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: async () => {
            setShowPauseMenu(false);
            particleSystem.clearParticles();
            await initializeGame();
            AudioManager.playUISound('select');
          },
        },
      ]
    );
  };

  const handleUndo = () => {
    if (gameEngine && gameEngine.canUndo()) {
      gameEngine.undoLastMove();
      AudioManager.playUISound('deselect');
    } else {
      AudioManager.playUISound('error');
    }
  };

  const handleHint = () => {
    if (gameEngine) {
      const hint = gameEngine.getHint();
      if (hint) {
        // TODO: Highlight suggested move
        AdMobManager.onGameEvent('hint_used', { level });
        AudioManager.playUISound('select');
      } else {
        // Show option to watch ad for hints
        setRewardType('extra_hints');
        setShowRewardedModal(true);
      }
    }
  };

  const handleBackToMenu = () => {
    Alert.alert(
      'Exit Game', 
      'Do you want to save your progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save & Exit',
          onPress: async () => {
            if (gameEngine) {
              await gameEngine.saveGame();
            }
            navigation.goBack();
          },
        },
        {
          text: 'Exit Without Saving',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleNextLevel = () => {
    setShowVictoryModal(false);
    navigation.replace('GameScreen', { level: level + 1 });
  };

  const handlePlayAgain = () => {
    setShowVictoryModal(false);
    AdMobManager.onGameEvent('game_started', { level });
    initializeGame();
  };

  const handleRewardEarned = (reward) => {
    console.log('🎁 Reward earned in GameScreen:', reward);
    // Handle the reward based on type
    if (reward && reward.type === 'hints') {
      // Add hints to game engine or show notification
      Alert.alert('Hints Added!', `You received ${reward.amount} extra hints!`);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Level {level}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Game Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackToMenu}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.levelText}>Level {level}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="timer" size={16} color="#FFF" />
              <Text style={styles.statText}>{formatTime(timer)}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="touch-app" size={16} color="#FFF" />
              <Text style={styles.statText}>{moves}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={16} color="#FFF" />
              <Text style={styles.statText}>{score}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.headerButton} onPress={handlePause}>
          <Icon name="pause" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Game Board */}
      <View style={styles.gameContainer}>
        {gameEngine && (
          <GameBoard
            gameEngine={gameEngine}
            level={level}
            onGameStateChange={handleGameStateChange}
            style={styles.gameBoard}
          />
        )}
        
        {/* Particle System */}
        <ParticleSystem particles={particleSystem.particles} />
      </View>

      {/* Game Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, !gameEngine?.canUndo() && styles.controlButtonDisabled]} 
          onPress={handleUndo}
          disabled={!gameEngine?.canUndo()}
        >
          <Icon name="undo" size={24} color={gameEngine?.canUndo() ? "#FFF" : "#666"} />
          <Text style={[styles.controlText, !gameEngine?.canUndo() && styles.controlTextDisabled]}>Undo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleRestart}>
          <Icon name="refresh" size={24} color="#FFF" />
          <Text style={styles.controlText}>Restart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleHint}>
          <Icon name="lightbulb-outline" size={24} color="#FFF" />
          <Text style={styles.controlText}>Hint</Text>
        </TouchableOpacity>
      </View>

      {/* Pause Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPauseMenu}
        onRequestClose={handleResume}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pauseMenu}>
            <Text style={styles.pauseTitle}>Game Paused</Text>
            
            <TouchableOpacity style={styles.menuButton} onPress={handleResume}>
              <Icon name="play-arrow" size={24} color="#FFF" />
              <Text style={styles.menuButtonText}>Resume</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuButton} onPress={handleRestart}>
              <Icon name="refresh" size={24} color="#FFF" />
              <Text style={styles.menuButtonText}>Restart Level</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuButton} onPress={() => {
              AudioManager.toggleSound();
              AudioManager.playUISound('select');
            }}>
              <Icon name={AudioManager.isSoundEnabled() ? "volume-up" : "volume-off"} size={24} color="#FFF" />
              <Text style={styles.menuButtonText}>
                {AudioManager.isSoundEnabled() ? 'Sound On' : 'Sound Off'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuButton, styles.exitButton]} onPress={handleBackToMenu}>
              <Icon name="exit-to-app" size={24} color="#FFF" />
              <Text style={styles.menuButtonText}>Exit Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Victory Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVictoryModal}
        onRequestClose={() => setShowVictoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.victoryMenu}>
            <Text style={styles.victoryTitle}>🎉 Level Complete! 🎉</Text>
            
            <View style={styles.victoryStats}>
              <View style={styles.victoryStat}>
                <Icon name="timer" size={20} color="#4CAF50" />
                <Text style={styles.victoryStatText}>Time: {formatTime(timer)}</Text>
              </View>
              
              <View style={styles.victoryStat}>
                <Icon name="touch-app" size={20} color="#4CAF50" />
                <Text style={styles.victoryStatText}>Moves: {moves}</Text>
              </View>
              
              <View style={styles.victoryStat}>
                <Icon name="star" size={20} color="#4CAF50" />
                <Text style={styles.victoryStatText}>Score: {score}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.victoryButton} onPress={handleNextLevel}>
              <Icon name="arrow-forward" size={24} color="#FFF" />
              <Text style={styles.victoryButtonText}>Next Level</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.victoryButton, styles.secondaryButton]} onPress={handlePlayAgain}>
              <Icon name="replay" size={24} color="#4CAF50" />
              <Text style={[styles.victoryButtonText, { color: '#4CAF50' }]}>Play Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.victoryButton, styles.secondaryButton]} onPress={() => {
              setShowVictoryModal(false);
              navigation.goBack();
            }}>
              <Icon name="home" size={24} color="#4CAF50" />
              <Text style={[styles.victoryButtonText, { color: '#4CAF50' }]}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        visible={showRewardedModal}
        onClose={() => setShowRewardedModal(false)}
        onRewardEarned={handleRewardEarned}
        rewardType={rewardType}
      />

      {/* Banner Ad */}
      <BannerAdComponent position="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#34495E',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  gameContainer: {
    flex: 1,
    position: 'relative',
  },
  gameBoard: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#34495E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 70,
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  controlText: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
    fontWeight: '500',
  },
  controlTextDisabled: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseMenu: {
    backgroundColor: '#34495E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 6,
    minWidth: 200,
  },
  exitButton: {
    backgroundColor: '#E74C3C',
    marginTop: 8,
  },
  menuButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  victoryMenu: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 320,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  victoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 24,
    textAlign: 'center',
  },
  victoryStats: {
    alignItems: 'center',
    marginBottom: 24,
  },
  victoryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  victoryStatText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 8,
    fontWeight: '500',
  },
  victoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 6,
    minWidth: 240,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  victoryButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GameScreen;