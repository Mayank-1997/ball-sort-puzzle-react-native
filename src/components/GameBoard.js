/**
 * Game Board Component for React Native Ball Sort Puzzle Game
 * Renders the complete game board with tubes and balls
 */

import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { View, Dimensions, ScrollView, Animated, PanGestureHandler, State, Text } from 'react-native';
import { GameEngine } from '../services/GameEngine';
import { AudioManager } from '../services/AudioManager';
import Tube from './Tube';
import Ball from './Ball';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameBoard = memo(({ 
  gameEngine,
  level,
  onGameStateChange,
  style 
}) => {
  const [gameState, setGameState] = useState(null);
  const [selectedTube, setSelectedTube] = useState(null);
  const [animatingBall, setAnimatingBall] = useState(null);
  const [boardLayout, setBoardLayout] = useState({ tubes: [], dimensions: {} });
  
  const scrollViewRef = useRef(null);
  const animationRef = useRef(null);

  // Game state listener
  useEffect(() => {
    if (!gameEngine) return;

    const handleGameStateChange = (newState) => {
      setGameState(newState);
      calculateBoardLayout(newState);
      if (onGameStateChange) {
        onGameStateChange(newState);
      }
    };

    // Subscribe to game engine events
    gameEngine.addEventListener('stateChanged', handleGameStateChange);
    gameEngine.addEventListener('moveCompleted', handleMoveCompleted);
    gameEngine.addEventListener('moveError', handleMoveError);
    gameEngine.addEventListener('levelCompleted', handleLevelCompleted);

    // Initialize game state
    const initialState = gameEngine.getGameState();
    handleGameStateChange(initialState);

    return () => {
      gameEngine.removeEventListener('stateChanged', handleGameStateChange);
      gameEngine.removeEventListener('moveCompleted', handleMoveCompleted);
      gameEngine.removeEventListener('moveError', handleMoveError);
      gameEngine.removeEventListener('levelCompleted', handleLevelCompleted);
    };
  }, [gameEngine, level]);

  // Calculate board layout based on number of tubes
  const calculateBoardLayout = useCallback((state) => {
    if (!state || !state.tubes) return;

    const tubeCount = state.tubes.length;
    const tubeWidth = 70;
    const tubeHeight = 220;
    const tubeSpacing = 20;
    const boardPadding = 20;

    // Calculate optimal grid layout
    const maxTubesPerRow = Math.floor((screenWidth - boardPadding * 2) / (tubeWidth + tubeSpacing));
    const tubesPerRow = Math.min(maxTubesPerRow, Math.ceil(Math.sqrt(tubeCount)));
    const rows = Math.ceil(tubeCount / tubesPerRow);

    const totalWidth = tubesPerRow * (tubeWidth + tubeSpacing) - tubeSpacing + boardPadding * 2;
    const totalHeight = rows * (tubeHeight + tubeSpacing) - tubeSpacing + boardPadding * 2;

    const tubes = state.tubes.map((tube, index) => {
      const row = Math.floor(index / tubesPerRow);
      const col = index % tubesPerRow;
      
      const x = boardPadding + col * (tubeWidth + tubeSpacing);
      const y = boardPadding + row * (tubeHeight + tubeSpacing);

      return {
        id: tube.id,
        x,
        y,
        width: tubeWidth,
        height: tubeHeight,
        balls: tube.balls || [],
        isSelected: selectedTube === tube.id
      };
    });

    setBoardLayout({
      tubes,
      dimensions: {
        width: Math.max(totalWidth, screenWidth),
        height: Math.max(totalHeight, screenHeight * 0.7),
        tubeWidth,
        tubeHeight,
        rows,
        tubesPerRow
      }
    });
  }, [selectedTube]);

  // Handle tube/ball press
  const handleTubePress = useCallback(async (tubeId, ballIndex = null) => {
    if (!gameEngine || animatingBall) return;

    try {
      if (selectedTube === null) {
        // Select tube/ball
        const tube = gameState.tubes.find(t => t.id === tubeId);
        if (tube && tube.balls.length > 0) {
          setSelectedTube(tubeId);
          AudioManager.playUISound('select');
        }
      } else if (selectedTube === tubeId) {
        // Deselect same tube
        setSelectedTube(null);
        AudioManager.playUISound('deselect');
      } else {
        // Attempt move
        const success = await performMove(selectedTube, tubeId);
        if (success) {
          setSelectedTube(null);
        }
      }
    } catch (error) {
      console.error('Error handling tube press:', error);
      AudioManager.playUISound('error');
    }
  }, [gameEngine, gameState, selectedTube, animatingBall]);

  // Perform ball move with animation
  const performMove = useCallback(async (fromTubeId, toTubeId) => {
    if (!gameEngine) return false;

    try {
      // Validate move
      const canMove = gameEngine.canMoveBall(fromTubeId, toTubeId);
      if (!canMove) {
        AudioManager.playUISound('error');
        return false;
      }

      // Get tube positions for animation
      const fromTube = boardLayout.tubes.find(t => t.id === fromTubeId);
      const toTube = boardLayout.tubes.find(t => t.id === toTubeId);
      
      if (!fromTube || !toTube) return false;

      // Start animation
      setAnimatingBall({
        fromTube: fromTubeId,
        toTube: toTubeId,
        fromPosition: { x: fromTube.x, y: fromTube.y },
        toPosition: { x: toTube.x, y: toTube.y }
      });

      // Perform the move
      const moveResult = await gameEngine.moveBall(fromTubeId, toTubeId);
      
      if (moveResult.success) {
        // Animate ball movement
        await animateBallMovement(fromTube, toTube);
        AudioManager.playUISound('transfer');
        return true;
      } else {
        AudioManager.playUISound('error');
        setAnimatingBall(null);
        return false;
      }
    } catch (error) {
      console.error('Error performing move:', error);
      AudioManager.playUISound('error');
      setAnimatingBall(null);
      return false;
    }
  }, [gameEngine, boardLayout]);

  // Animate ball movement
  const animateBallMovement = useCallback((fromTube, toTube) => {
    return new Promise((resolve) => {
      const duration = 400;
      
      // Create animation values
      const startX = fromTube.x + fromTube.width / 2;
      const startY = fromTube.y + 20;
      const endX = toTube.x + toTube.width / 2;
      const endY = toTube.y + 20;
      
      const midY = Math.min(startY, endY) - 60; // Arc height
      
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Simulate curved motion
      let progress = 0;
      const animate = () => {
        progress += 16 / duration; // Assuming 60fps
        
        if (progress >= 1) {
          setAnimatingBall(null);
          resolve();
          return;
        }

        // Quadratic bezier curve
        const t = progress;
        const invT = 1 - t;
        const x = invT * invT * startX + 2 * invT * t * ((startX + endX) / 2) + t * t * endX;
        const y = invT * invT * startY + 2 * invT * t * midY + t * t * endY;

        setAnimatingBall(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
        
        requestAnimationFrame(animate);
      };
      
      animationRef.current = { stop: () => {} };
      requestAnimationFrame(animate);
    });
  }, []);

  // Event handlers
  const handleMoveCompleted = useCallback((event) => {
    console.log('Move completed:', event);
  }, []);

  const handleMoveError = useCallback((event) => {
    console.log('Move error:', event);
    AudioManager.playUISound('error');
  }, []);

  const handleLevelCompleted = useCallback((event) => {
    console.log('Level completed:', event);
    AudioManager.playSoundSequence(['victory', 'congratulations'], 800);
    setSelectedTube(null);
  }, []);

  // Render loading state
  if (!gameState || !boardLayout.tubes.length) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: boardLayout.dimensions.width,
          height: boardLayout.dimensions.height,
          minHeight: '100%'
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
      >
        <View
          style={{
            width: boardLayout.dimensions.width,
            height: boardLayout.dimensions.height,
            position: 'relative'
          }}
        >
          {/* Render tubes */}
          {boardLayout.tubes.map((tube) => (
            <Tube
              key={tube.id}
              tubeId={tube.id}
              balls={tube.balls}
              x={tube.x}
              y={tube.y}
              width={tube.width}
              height={tube.height}
              isSelected={tube.isSelected}
              onPress={handleTubePress}
              ballSize={32}
              spacing={4}
            />
          ))}

          {/* Render animating ball */}
          {animatingBall && animatingBall.currentX && (
            <Ball
              ballId="animating"
              tubeId="none"
              position={0}
              color="#FF6B6B"
              x={animatingBall.currentX - 16}
              y={animatingBall.currentY - 16}
              size={32}
              isAnimating={true}
              zIndex={1000}
            />
          )}
        </View>
      </ScrollView>

      {/* Debug info */}
      {__DEV__ && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 8,
            borderRadius: 4
          }}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>
            Level: {level} | Tubes: {boardLayout.tubes.length} | Selected: {selectedTube || 'none'}
          </Text>
          <Text style={{ color: 'white', fontSize: 10 }}>
            Layout: {boardLayout.dimensions.tubesPerRow}x{boardLayout.dimensions.rows}
          </Text>
        </View>
      )}
    </View>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;