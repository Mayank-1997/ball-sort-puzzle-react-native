/**
 * Ball Sort Puzzle - React Native App Entry Point
 * Main application component with navigation and global providers
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  Alert,
  AppState,
  Linking,
  BackHandler,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';

// Import services
import { AudioManager } from './src/services/AudioManager';
import { AdMobManager } from './src/services/AdMobManager';
import { GooglePlayGamesManager } from './src/services/GooglePlayGamesManager';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeApp();
    
    // Set up app state change listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Set up deep link listener
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);
    
    // Set up back button handler for Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      appStateSubscription?.remove();
      linkingSubscription?.remove();
      backHandler.remove();
      
      // Cleanup services
      AudioManager.cleanup();
      AdMobManager.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🎮 Initializing Ball Sort Puzzle App...');
      
      // Initialize audio system
      await AudioManager.initialize();
      console.log('🔊 Audio system initialized');
      
      // Initialize AdMob system
      await AdMobManager.initialize();
      console.log('📱 AdMob system initialized');
      
      // Initialize Google Play Games Services
      await GooglePlayGamesManager.initialize();
      console.log('🎯 Google Play Games Services initialized');
      
      // Check for initial deep link
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleDeepLink({ url: initialURL });
      }
      
      setIsInitialized(true);
      console.log('✅ App initialization complete');
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Some features may not work properly. Please restart the app.',
        [{ text: 'OK' }]
      );
      setIsInitialized(true); // Continue anyway
    }
  };

  const handleAppStateChange = (nextAppState) => {
    console.log('📱 App state changed:', appState, '->', nextAppState);
    
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      console.log('🎮 App resumed');
      AudioManager.resumeBackgroundMusic();
      AdMobManager.onAppResume();
    } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App has gone to the background
      console.log('😴 App backgrounded');
      AudioManager.pauseBackgroundMusic();
      AdMobManager.onAppPause();
    }
    
    setAppState(nextAppState);
  };

  const handleDeepLink = ({ url }) => {
    console.log('🔗 Deep link received:', url);
    
    // Parse and handle deep links
    // Format: ballsortpuzzle://action?params
    try {
      const urlObj = new URL(url);
      const action = urlObj.pathname.replace('/', '');
      const params = Object.fromEntries(urlObj.searchParams);
      
      switch (action) {
        case 'level':
          // Navigate to specific level
          if (params.id) {
            console.log('🎯 Opening level:', params.id);
            // Handle level navigation
          }
          break;
        case 'challenge':
          // Handle friend challenge
          if (params.challengeId) {
            console.log('⚔️ Opening challenge:', params.challengeId);
            // Handle challenge
          }
          break;
        case 'achievement':
          // Show specific achievement
          if (params.id) {
            console.log('🏆 Showing achievement:', params.id);
            // Handle achievement display
          }
          break;
        default:
          console.log('❓ Unknown deep link action:', action);
      }
    } catch (error) {
      console.error('❌ Failed to parse deep link:', error);
    }
  };

  const handleBackPress = () => {
    // Let React Navigation handle back press
    return false;
  };

  if (!isInitialized) {
    // You could show a loading screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2C3E50"
        translucent={false}
      />
      
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Menu"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        >
          <Stack.Screen
            name="Menu"
            component={MenuScreen}
            options={{
              title: 'Ball Sort Puzzle',
              gestureEnabled: false, // Disable swipe back on main menu
            }}
          />
          
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{
              title: 'Game',
              gestureEnabled: false, // Disable swipe back during gameplay
            }}
          />
          
          <Stack.Screen
            name="LevelSelect"
            component={LevelSelectScreen}
            options={{
              title: 'Select Level',
              animation: 'fade_from_bottom',
            }}
          />
          
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              animation: 'slide_from_bottom',
            }}
          />
          
          <Stack.Screen
            name="Achievements"
            component={AchievementsScreen}
            options={{
              title: 'Achievements',
              animation: 'slide_from_right',
            }}
          />
          
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{
              title: 'Leaderboards',
              animation: 'slide_from_right',
            }}
          />
          
          <Stack.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={{
              title: 'Statistics',
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;