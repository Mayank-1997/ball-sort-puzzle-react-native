/**
 * Particle System for React Native Ball Sort Puzzle Game
 * Creates visual effects and animations
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Particle = memo(({ 
  x, 
  y, 
  color, 
  size = 4, 
  velocity = { x: 0, y: -2 }, 
  life = 1000,
  type = 'circle'
}) => {
  const animatedX = useRef(new Animated.Value(x)).current;
  const animatedY = useRef(new Animated.Value(y)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const animatedScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate particle movement and fade out
    Animated.parallel([
      Animated.timing(animatedX, {
        toValue: x + velocity.x * 50,
        duration: life,
        useNativeDriver: false,
      }),
      Animated.timing(animatedY, {
        toValue: y + velocity.y * 50,
        duration: life,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: life,
        useNativeDriver: false,
      }),
      Animated.timing(animatedScale, {
        toValue: type === 'star' ? 0.2 : 0.8,
        duration: life,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const renderParticle = () => {
    switch (type) {
      case 'star':
        return (
          <Path
            d={`M ${size} 0 L ${size * 1.2} ${size * 0.8} L ${size * 2} ${size * 0.8} L ${size * 1.4} ${size * 1.4} L ${size * 1.6} ${size * 2.2} L ${size} ${size * 1.8} L ${size * 0.4} ${size * 2.2} L ${size * 0.6} ${size * 1.4} L 0 ${size * 0.8} L ${size * 0.8} ${size * 0.8} Z`}
            fill={color}
          />
        );
      case 'heart':
        return (
          <Path
            d={`M ${size} ${size * 1.8} C ${size} ${size * 1.4}, 0 ${size * 0.6}, 0 ${size * 0.4} C 0 ${size * 0.2}, ${size * 0.2} 0, ${size * 0.5} 0 C ${size * 0.7} 0, ${size} ${size * 0.2}, ${size} ${size * 0.4} C ${size} ${size * 0.2}, ${size * 1.3} 0, ${size * 1.5} 0 C ${size * 1.8} 0, ${size * 2} ${size * 0.2}, ${size * 2} ${size * 0.4} C ${size * 2} ${size * 0.6}, ${size} ${size * 1.4}, ${size} ${size * 1.8} Z`}
            fill={color}
          />
        );
      default:
        return <Circle cx={size} cy={size} r={size} fill={color} />;
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: animatedX,
        top: animatedY,
        opacity: animatedOpacity,
        transform: [{ scale: animatedScale }],
      }}
    >
      <Svg width={size * 2} height={size * 2}>
        {renderParticle()}
      </Svg>
    </Animated.View>
  );
});

const ParticleSystem = memo(({
  particles = [],
  style
}) => {
  return (
    <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }, style]}>
      {particles.map((particle, index) => (
        <Particle
          key={`${particle.id}-${index}`}
          x={particle.x}
          y={particle.y}
          color={particle.color}
          size={particle.size}
          velocity={particle.velocity}
          life={particle.life}
          type={particle.type}
        />
      ))}
    </View>
  );
});

// Particle effect generator functions
export const createSuccessParticles = (x, y, color = '#4CAF50') => {
  const particles = [];
  const particleCount = 12;
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    
    particles.push({
      id: `success-${Date.now()}-${i}`,
      x: x,
      y: y,
      color: color,
      size: 3 + Math.random() * 4,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 1,
      },
      life: 800 + Math.random() * 400,
      type: 'star'
    });
  }
  
  return particles;
};

export const createErrorParticles = (x, y, color = '#F44336') => {
  const particles = [];
  const particleCount = 8;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      id: `error-${Date.now()}-${i}`,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      color: color,
      size: 2 + Math.random() * 3,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: -1 - Math.random() * 2,
      },
      life: 600 + Math.random() * 300,
      type: 'circle'
    });
  }
  
  return particles;
};

export const createLevelCompleteParticles = (screenWidth, screenHeight) => {
  const particles = [];
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      id: `victory-${Date.now()}-${i}`,
      x: Math.random() * screenWidth,
      y: screenHeight + Math.random() * 100,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 6,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: -3 - Math.random() * 4,
      },
      life: 2000 + Math.random() * 1000,
      type: Math.random() > 0.5 ? 'star' : 'heart'
    });
  }
  
  return particles;
};

export const createBallTrailParticles = (x, y, color) => {
  const particles = [];
  const particleCount = 5;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      id: `trail-${Date.now()}-${i}`,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      color: color,
      size: 2 + Math.random() * 2,
      velocity: {
        x: (Math.random() - 0.5) * 1,
        y: Math.random() * 1,
      },
      life: 300 + Math.random() * 200,
      type: 'circle'
    });
  }
  
  return particles;
};

// Particle manager hook
export const useParticleSystem = () => {
  const [particles, setParticles] = useState([]);
  const timeoutRefs = useRef([]);

  const addParticles = (newParticles) => {
    setParticles(prev => [...prev, ...newParticles]);
    
    // Remove particles after their lifetime
    newParticles.forEach(particle => {
      const timeout = setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id));
      }, particle.life + 100);
      
      timeoutRefs.current.push(timeout);
    });
  };

  const clearParticles = () => {
    setParticles([]);
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  };

  const createSuccessEffect = (x, y, color) => {
    const newParticles = createSuccessParticles(x, y, color);
    addParticles(newParticles);
  };

  const createErrorEffect = (x, y, color) => {
    const newParticles = createErrorParticles(x, y, color);
    addParticles(newParticles);
  };

  const createVictoryEffect = () => {
    const newParticles = createLevelCompleteParticles(screenWidth, screenHeight);
    addParticles(newParticles);
  };

  const createTrailEffect = (x, y, color) => {
    const newParticles = createBallTrailParticles(x, y, color);
    addParticles(newParticles);
  };

  return {
    particles,
    addParticles,
    clearParticles,
    createSuccessEffect,
    createErrorEffect,
    createVictoryEffect,
    createTrailEffect,
  };
};

Particle.displayName = 'Particle';
ParticleSystem.displayName = 'ParticleSystem';

export default ParticleSystem;