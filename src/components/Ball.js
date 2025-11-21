/**
 * Ball Component for React Native Ball Sort Puzzle Game
 * Renders individual balls with expressions using SVG
 */

import React, { memo, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Circle, Path, Ellipse, G } from 'react-native-svg';
import { BallExpressionSystem } from '../utils/BallExpressionSystem';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const Ball = memo(({ 
  color, 
  x, 
  y, 
  size = 40, 
  ballId, 
  tubeId, 
  position, 
  isSelected = false, 
  isAnimating = false,
  onPress,
  zIndex = 1,
  opacity = 1,
  scale = 1
}) => {
  const animatedValue = useRef(new Animated.Value(1)).current;
  const positionX = useRef(new Animated.Value(x)).current;
  const positionY = useRef(new Animated.Value(y)).current;
  const scaleValue = useRef(new Animated.Value(scale)).current;
  const opacityValue = useRef(new Animated.Value(opacity)).current;

  // Get ball expression
  const expression = BallExpressionSystem.getBallExpression(ballId, tubeId, position);

  // Update animations when props change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(positionX, {
        toValue: x,
        duration: isAnimating ? 300 : 0,
        useNativeDriver: false,
      }),
      Animated.timing(positionY, {
        toValue: y,
        duration: isAnimating ? 300 : 0,
        useNativeDriver: false,
      }),
      Animated.timing(scaleValue, {
        toValue: scale,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(opacityValue, {
        toValue: opacity,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [x, y, scale, opacity, isAnimating]);

  // Selection animation
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isSelected]);

  // Convert hex color to RGB for effects
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgb = hexToRgb(color);
  const darkerColor = `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})`;
  const lighterColor = `rgb(${Math.min(255, rgb.r + 60)}, ${Math.min(255, rgb.g + 60)}, ${Math.min(255, rgb.b + 60)})`;

  // Render expression based on type
  const renderExpression = () => {
    const eyeY = size * 0.3;
    const eyeSize = size * 0.08;
    const mouthY = size * 0.55;
    
    switch (expression.type) {
      case 'angry':
        return (
          <G>
            {/* Angry eyebrows */}
            <Path
              d={`M ${size * 0.25} ${size * 0.25} L ${size * 0.4} ${size * 0.35}`}
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d={`M ${size * 0.75} ${size * 0.25} L ${size * 0.6} ${size * 0.35}`}
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Eyes */}
            <Circle cx={size * 0.35} cy={eyeY} r={eyeSize} fill="#333" />
            <Circle cx={size * 0.65} cy={eyeY} r={eyeSize} fill="#333" />
            {/* Frown */}
            <Path
              d={`M ${size * 0.3} ${mouthY + size * 0.1} Q ${size * 0.5} ${mouthY - size * 0.05} ${size * 0.7} ${mouthY + size * 0.1}`}
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
          </G>
        );

      case 'laughing':
        return (
          <G>
            {/* Happy eyes (crescents) */}
            <Path
              d={`M ${size * 0.25} ${eyeY} Q ${size * 0.35} ${eyeY - size * 0.08} ${size * 0.45} ${eyeY}`}
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
            <Path
              d={`M ${size * 0.55} ${eyeY} Q ${size * 0.65} ${eyeY - size * 0.08} ${size * 0.75} ${eyeY}`}
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
            {/* Wide smile */}
            <Path
              d={`M ${size * 0.25} ${mouthY} Q ${size * 0.5} ${mouthY + size * 0.15} ${size * 0.75} ${mouthY}`}
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
          </G>
        );

      case 'crying':
        return (
          <G>
            {/* Sad eyes */}
            <Circle cx={size * 0.35} cy={eyeY} r={eyeSize} fill="#333" />
            <Circle cx={size * 0.65} cy={eyeY} r={eyeSize} fill="#333" />
            {/* Tears */}
            <Ellipse cx={size * 0.3} cy={eyeY + size * 0.15} rx={size * 0.03} ry={size * 0.08} fill="#87CEEB" />
            <Ellipse cx={size * 0.7} cy={eyeY + size * 0.15} rx={size * 0.03} ry={size * 0.08} fill="#87CEEB" />
            {/* Sad mouth */}
            <Path
              d={`M ${size * 0.35} ${mouthY + size * 0.05} Q ${size * 0.5} ${mouthY - size * 0.1} ${size * 0.65} ${mouthY + size * 0.05}`}
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
          </G>
        );

      case 'surprised':
        return (
          <G>
            {/* Wide eyes */}
            <Circle cx={size * 0.35} cy={eyeY} r={eyeSize * 1.3} fill="#fff" stroke="#333" strokeWidth="1" />
            <Circle cx={size * 0.65} cy={eyeY} r={eyeSize * 1.3} fill="#fff" stroke="#333" strokeWidth="1" />
            <Circle cx={size * 0.35} cy={eyeY} r={eyeSize * 0.8} fill="#333" />
            <Circle cx={size * 0.65} cy={eyeY} r={eyeSize * 0.8} fill="#333" />
            {/* Open mouth */}
            <Ellipse cx={size * 0.5} cy={mouthY} rx={size * 0.08} ry={size * 0.12} fill="#333" />
          </G>
        );

      case 'sleeping':
        return (
          <G>
            {/* Closed eyes */}
            <Path
              d={`M ${size * 0.25} ${eyeY} L ${size * 0.45} ${eyeY}`}
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d={`M ${size * 0.55} ${eyeY} L ${size * 0.75} ${eyeY}`}
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Sleeping mouth */}
            <Circle cx={size * 0.5} cy={mouthY} r={size * 0.04} fill="none" stroke="#333" strokeWidth="1" />
            {/* Z's */}
            <Path
              d={`M ${size * 0.8} ${size * 0.2} L ${size * 0.85} ${size * 0.2} L ${size * 0.8} ${size * 0.25} L ${size * 0.85} ${size * 0.25}`}
              stroke="#333"
              strokeWidth="1"
              fill="none"
            />
            <Path
              d={`M ${size * 0.85} ${size * 0.1} L ${size * 0.92} ${size * 0.1} L ${size * 0.85} ${size * 0.17} L ${size * 0.92} ${size * 0.17}`}
              stroke="#333"
              strokeWidth="1"
              fill="none"
            />
          </G>
        );

      default:
        return (
          <G>
            {/* Normal eyes */}
            <Circle cx={size * 0.35} cy={eyeY} r={eyeSize} fill="#333" />
            <Circle cx={size * 0.65} cy={eyeY} r={eyeSize} fill="#333" />
            {/* Normal mouth */}
            <Path
              d={`M ${size * 0.4} ${mouthY} Q ${size * 0.5} ${mouthY + size * 0.05} ${size * 0.6} ${mouthY}`}
              stroke="#333"
              strokeWidth="1.5"
              fill="none"
            />
          </G>
        );
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: positionX,
        top: positionY,
        width: size,
        height: size,
        zIndex: zIndex,
        opacity: opacityValue,
      }}
      onTouchEnd={onPress}
    >
      <AnimatedSvg
        width={size}
        height={size}
        style={{
          transform: [{ scale: Animated.multiply(animatedValue, scaleValue) }],
        }}
      >
        {/* Ball shadow */}
        <Ellipse
          cx={size * 0.5}
          cy={size * 0.9}
          rx={size * 0.35}
          ry={size * 0.1}
          fill="rgba(0,0,0,0.2)"
        />
        
        {/* Main ball circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.4}
          fill={color}
          stroke={isSelected ? '#FFD700' : darkerColor}
          strokeWidth={isSelected ? 3 : 1}
        />

        {/* Ball highlight */}
        <Ellipse
          cx={size * 0.38}
          cy={size * 0.35}
          rx={size * 0.12}
          ry={size * 0.08}
          fill={lighterColor}
          opacity={0.6}
        />

        {/* Ball shine */}
        <Circle
          cx={size * 0.37}
          cy={size * 0.33}
          r={size * 0.05}
          fill="rgba(255,255,255,0.8)"
        />

        {/* Render expression */}
        {renderExpression()}

        {/* Selection glow effect */}
        {isSelected && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.45}
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            opacity={0.6}
          />
        )}
      </AnimatedSvg>
    </Animated.View>
  );
});

Ball.displayName = 'Ball';

export default Ball;