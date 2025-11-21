/**
 * Ball Expression System for React Native Ball Sort Game
 * Converted from original HTML5 version
 */

export class BallExpressionSystem {
  constructor() {
    // Define all available expressions
    this.expressions = [
      'angry',
      'laughing', 
      'crying',
      'surprised',
      'sleeping'
    ];
    
    // Cache for level-based expression mappings
    this.levelExpressionCache = new Map();
  }

  /**
   * Generate a pseudo-random number based on level and color
   * This ensures consistent expressions for same colors in same level
   */
  generateSeed(level, colorIndex) {
    // Enhanced seed generation for better distribution
    const levelSeed = level * 37;
    const colorSeed = colorIndex * 23;
    const mixedSeed = (levelSeed + colorSeed) * 13;
    
    // Use a larger modulus to avoid patterns
    return Math.abs(mixedSeed) % 999983;
  }

  /**
   * Get a pseudo-random number between 0 and max-1 using a seed
   */
  seededRandom(seed, max) {
    // Linear congruential generator for consistent randomness
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    const x = (a * seed + c) % m;
    return Math.floor((x / m) * max);
  }

  /**
   * Get expression for a specific color in a specific level
   * Same colors in same level will always have same expression
   */
  getExpressionForColor(level, colorIndex) {
    const seed = this.generateSeed(level, colorIndex);
    const expressionIndex = this.seededRandom(seed, this.expressions.length);
    return this.expressions[expressionIndex];
  }

  /**
   * Generate expression mapping for all colors in a level
   * Returns object: {0: 'angry', 1: 'laughing', 2: 'crying', ...}
   */
  generateLevelExpressions(level, totalColors) {
    const expressions = {};
    
    // For better variety, use a round-robin approach combined with level-based offset
    const levelOffset = (level * 3) % this.expressions.length;
    
    for (let colorIndex = 0; colorIndex < totalColors; colorIndex++) {
      // Calculate expression index ensuring variety
      let expressionIndex;
      
      if (totalColors <= this.expressions.length) {
        // If we have enough expressions for all colors, distribute them evenly
        expressionIndex = (colorIndex + levelOffset) % this.expressions.length;
      } else {
        // More colors than expressions, use the original algorithm
        expressionIndex = Math.abs(this.generateSeed(level, colorIndex)) % this.expressions.length;
      }
      
      const expression = this.expressions[expressionIndex];
      expressions[colorIndex] = expression;
    }
    
    // Debug output for first few levels
    if (level <= 5) {
      console.log(`Level ${level} expressions:`, expressions);
    }
    
    return expressions;
  }

  /**
   * Get a deterministic seed for expression assignment
   */
  getExpressionSeed(level, colorIndex) {
    const levelFactor = (level * 7) % 997;
    const colorFactor = (colorIndex * 11) % 991;
    return levelFactor + colorFactor + (level + colorIndex) * 3;
  }

  /**
   * Convert old ball format (number) to new format (object)
   */
  convertBallToObject(colorIndex, level) {
    return {
      color: colorIndex,
      expression: this.getExpressionForColor(level, colorIndex)
    };
  }

  /**
   * Convert new ball format (object) to old format (number) for compatibility
   */
  convertBallToNumber(ballObject) {
    return typeof ballObject === 'object' ? ballObject.color : ballObject;
  }

  /**
   * Get ball color (works with both old and new formats)
   */
  getBallColor(ball) {
    return typeof ball === 'object' ? ball.color : ball;
  }

  /**
   * Get ball expression (works with both old and new formats)
   */
  getBallExpression(ball, level, fallbackColor) {
    if (typeof ball === 'object' && ball.expression) {
      return ball.expression;
    } else if (typeof ball === 'object' && ball.color !== undefined) {
      return this.getExpressionForColor(level, ball.color);
    } else {
      // Fallback for old format or missing data
      const colorIndex = typeof ball === 'number' ? ball : fallbackColor;
      return this.getExpressionForColor(level, colorIndex);
    }
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache() {
    this.levelExpressionCache.clear();
    console.log('Expression cache cleared');
  }

  /**
   * Get all available expressions
   */
  getAllExpressions() {
    return [...this.expressions];
  }

  /**
   * Validate if an expression is valid
   */
  isValidExpression(expression) {
    return this.expressions.includes(expression);
  }

  /**
   * Get random expression (for testing)
   */
  getRandomExpression() {
    return this.expressions[Math.floor(Math.random() * this.expressions.length)];
  }

  /**
   * Create test ball data for a level
   */
  createTestLevel(level, colorCount) {
    const balls = [];
    const expressions = this.generateLevelExpressions(level, colorCount);
    
    for (let colorIndex = 0; colorIndex < colorCount; colorIndex++) {
      for (let ballCount = 0; ballCount < 4; ballCount++) {
        balls.push(this.convertBallToObject(colorIndex, level));
      }
    }
    
    return {
      balls,
      expressions,
      level,
      colorCount
    };
  }

  /**
   * Debug method to test expression distribution
   */
  testExpressionDistribution(maxLevel = 10, maxColors = 8) {
    const distributionData = {};
    
    for (let level = 1; level <= maxLevel; level++) {
      for (let colors = 3; colors <= maxColors; colors++) {
        const expressions = this.generateLevelExpressions(level, colors);
        const key = `L${level}_C${colors}`;
        distributionData[key] = expressions;
      }
    }
    
    console.log('Expression Distribution Test:', distributionData);
    return distributionData;
  }
}