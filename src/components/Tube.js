/**
 * Tube Component for React Native Ball Sort Puzzle Game
 * Renders game tubes with balls using SVG
 */

import React, { memo, useCallback } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Svg, { Rect, Path, Defs, LinearGradient, Stop, Filter, FeDropShadow } from 'react-native-svg';
import Ball from './Ball';

const Tube = memo(({ 
  tubeId,
  balls = [],
  x,
  y,
  width = 60,
  height = 200,
  capacity = 4,
  isSelected = false,
  onPress,
  ballSize = 40,
  spacing = 5
}) => {
  // Calculate ball positions within tube
  const getBallPosition = useCallback((index) => {
    const ballY = y + height - (ballSize + spacing) - (index * (ballSize + spacing));
    const ballX = x + (width - ballSize) / 2;
    return { x: ballX, y: ballY };
  }, [x, y, width, height, ballSize, spacing]);

  // Tube colors and styling
  const tubeColor = isSelected ? '#4CAF50' : '#8B4513';
  const tubeStroke = isSelected ? '#2E7D32' : '#5D2F06';
  const shadowColor = isSelected ? 'rgba(76, 175, 80, 0.3)' : 'rgba(0, 0, 0, 0.2)';

  // Handle tube press
  const handleTubePress = useCallback(() => {
    if (onPress) {
      onPress(tubeId);
    }
  }, [onPress, tubeId]);

  // Handle ball press
  const handleBallPress = useCallback((ballIndex) => {
    if (onPress) {
      onPress(tubeId, ballIndex);
    }
  }, [onPress, tubeId]);

  return (
    <View style={{ position: 'absolute', left: 0, top: 0 }}>
      {/* Tube SVG */}
      <TouchableOpacity
        onPress={handleTubePress}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: width,
          height: height,
        }}
        activeOpacity={0.8}
      >
        <Svg width={width} height={height}>
          <Defs>
            {/* Tube gradient */}
            <LinearGradient id={`tubeGradient${tubeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={tubeColor} stopOpacity={0.8} />
              <Stop offset="50%" stopColor={tubeColor} stopOpacity={1} />
              <Stop offset="100%" stopColor={tubeColor} stopOpacity={0.8} />
            </LinearGradient>

            {/* Shadow filter */}
            <Filter id={`tubeShadow${tubeId}`}>
              <FeDropShadow dx="2" dy="4" stdDeviation="3" floodColor={shadowColor} />
            </Filter>
          </Defs>

          {/* Tube shadow */}
          <Rect
            x={4}
            y={6}
            width={width - 8}
            height={height - 10}
            rx={8}
            ry={8}
            fill="rgba(0,0,0,0.1)"
          />

          {/* Main tube body */}
          <Rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            rx={8}
            ry={8}
            fill={`url(#tubeGradient${tubeId})`}
            stroke={tubeStroke}
            strokeWidth={2}
            filter={`url(#tubeShadow${tubeId})`}
          />

          {/* Tube inner area */}
          <Rect
            x={6}
            y={6}
            width={width - 12}
            height={height - 12}
            rx={4}
            ry={4}
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />

          {/* Tube opening highlight */}
          <Rect
            x={4}
            y={2}
            width={width - 8}
            height={8}
            rx={4}
            ry={4}
            fill="rgba(255,255,255,0.3)"
          />

          {/* Capacity indicators (subtle marks) */}
          {Array.from({ length: capacity }, (_, i) => (
            <Path
              key={i}
              d={`M 8 ${height - 20 - (i * (ballSize + spacing))} L ${width - 8} ${height - 20 - (i * (ballSize + spacing))}`}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={0.5}
              strokeDasharray="2,2"
            />
          ))}

          {/* Selection glow */}
          {isSelected && (
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              rx={10}
              ry={10}
              fill="none"
              stroke="#FFD700"
              strokeWidth={3}
              opacity={0.7}
            />
          )}
        </Svg>
      </TouchableOpacity>

      {/* Render balls in tube */}
      {balls.map((ball, index) => {
        const position = getBallPosition(index);
        return (
          <Ball
            key={`${tubeId}-${index}`}
            ballId={ball.id}
            tubeId={tubeId}
            position={index}
            color={ball.color}
            x={position.x}
            y={position.y}
            size={ballSize}
            isSelected={ball.isSelected || false}
            onPress={() => handleBallPress(index)}
            zIndex={10 + index}
          />
        );
      })}

      {/* Tube label for debugging */}
      {__DEV__ && (
        <View
          style={{
            position: 'absolute',
            left: x,
            top: y - 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 2,
          }}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>T{tubeId}</Text>
        </View>
      )}
    </View>
  );
});

Tube.displayName = 'Tube';

export default Tube;