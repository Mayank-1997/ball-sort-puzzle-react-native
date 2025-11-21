/**
 * Settings Screen for React Native Ball Sort Puzzle Game
 * Game settings, audio controls, and app preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { AudioManager } from '../services/AudioManager';

const SettingsScreen = ({ navigation }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load current audio setting
      setSoundEnabled(AudioManager.isSoundEnabled());
      
      // TODO: Load other settings from AsyncStorage
      console.log('📱 Settings loaded');
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    }
  };

  const handleSoundToggle = (value) => {
    setSoundEnabled(value);
    AudioManager.setSoundEnabled(value);
    if (value) {
      AudioManager.playUISound('select');
    }
  };

  const handleMusicToggle = (value) => {
    setMusicEnabled(value);
    AudioManager.playUISound('select');
    // TODO: Implement background music control
  };

  const handleVibrationToggle = (value) => {
    setVibrationEnabled(value);
    AudioManager.playUISound('select');
    // TODO: Implement vibration control
  };

  const handleTimerToggle = (value) => {
    setShowTimer(value);
    AudioManager.playUISound('select');
    // TODO: Save timer preference
  };

  const handleHintsToggle = (value) => {
    setShowHints(value);
    AudioManager.playUISound('select');
    // TODO: Save hints preference
  };

  const handleAutoSaveToggle = (value) => {
    setAutoSave(value);
    AudioManager.playUISound('select');
    // TODO: Save auto-save preference
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    AudioManager.playUISound('select');
    // TODO: Save difficulty preference
  };

  const handleTestSounds = () => {
    AudioManager.playUISound('select');
    AudioManager.testAllSounds();
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset to defaults
            setSoundEnabled(true);
            setMusicEnabled(true);
            setVibrationEnabled(true);
            setShowTimer(true);
            setShowHints(true);
            setAutoSave(true);
            setDifficulty('normal');
            
            AudioManager.setSoundEnabled(true);
            AudioManager.playUISound('select');
            
            Alert.alert('Success', 'Settings have been reset to default.');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    AudioManager.playUISound('select');
    Alert.alert('Privacy Policy', 'Privacy policy will be displayed here or opened in browser.');
  };

  const handleTermsOfService = () => {
    AudioManager.playUISound('select');
    Alert.alert('Terms of Service', 'Terms of service will be displayed here or opened in browser.');
  };

  const handleContactSupport = () => {
    AudioManager.playUISound('select');
    Alert.alert('Contact Support', 'Support contact information or email composer will be shown here.');
  };

  const handleAbout = () => {
    AudioManager.playUISound('select');
    Alert.alert(
      'Ball Sort Puzzle',
      'Version 1.0.0\n\nA fun and addictive puzzle game with 1000 levels!\n\nDeveloped with React Native\n\n© 2025 Ball Sort Games',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderSettingItem = (title, description, value, onToggle, icon) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Icon name={icon} size={24} color="#3498DB" style={styles.settingIcon} />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#BDC3C7', true: '#3498DB' }}
        thumbColor={value ? '#FFF' : '#ECF0F1'}
        ios_backgroundColor="#BDC3C7"
      />
    </View>
  );

  const renderDifficultySelector = () => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Icon name="tune" size={24} color="#3498DB" style={styles.settingIcon} />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Difficulty Level</Text>
          <Text style={styles.settingDescription}>Adjust game difficulty</Text>
        </View>
      </View>
      <View style={styles.difficultyContainer}>
        {['easy', 'normal', 'hard'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.difficultyButton,
              difficulty === level && styles.difficultyButtonActive
            ]}
            onPress={() => handleDifficultyChange(level)}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === level && styles.difficultyTextActive
            ]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActionButton = (title, onPress, icon, style = {}) => (
    <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
      <Icon name={icon} size={20} color="#FFF" />
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>
          
          {renderSettingItem(
            'Sound Effects',
            'Enable game sound effects',
            soundEnabled,
            handleSoundToggle,
            'volume-up'
          )}
          
          {renderSettingItem(
            'Background Music',
            'Enable background music',
            musicEnabled,
            handleMusicToggle,
            'music-note'
          )}

          <TouchableOpacity style={styles.testSoundsButton} onPress={handleTestSounds}>
            <Icon name="play-circle-filled" size={20} color="#3498DB" />
            <Text style={styles.testSoundsText}>Test All Sounds</Text>
          </TouchableOpacity>
        </View>

        {/* Game Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          
          {renderSettingItem(
            'Vibration',
            'Enable haptic feedback',
            vibrationEnabled,
            handleVibrationToggle,
            'vibration'
          )}
          
          {renderSettingItem(
            'Show Timer',
            'Display game timer',
            showTimer,
            handleTimerToggle,
            'timer'
          )}
          
          {renderSettingItem(
            'Show Hints',
            'Enable hint system',
            showHints,
            handleHintsToggle,
            'lightbulb-outline'
          )}
          
          {renderSettingItem(
            'Auto Save',
            'Automatically save progress',
            autoSave,
            handleAutoSaveToggle,
            'save'
          )}

          {renderDifficultySelector()}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionButtonsContainer}>
            {renderActionButton('Reset Settings', handleResetSettings, 'restore', styles.dangerButton)}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <TouchableOpacity style={styles.infoItem} onPress={handleAbout}>
            <Icon name="info" size={24} color="#3498DB" />
            <Text style={styles.infoItemText}>About</Text>
            <Icon name="chevron-right" size={24} color="#BDC3C7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem} onPress={handlePrivacyPolicy}>
            <Icon name="privacy-tip" size={24} color="#3498DB" />
            <Text style={styles.infoItemText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={24} color="#BDC3C7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem} onPress={handleTermsOfService}>
            <Icon name="description" size={24} color="#3498DB" />
            <Text style={styles.infoItemText}>Terms of Service</Text>
            <Icon name="chevron-right" size={24} color="#BDC3C7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem} onPress={handleContactSupport}>
            <Icon name="support" size={24} color="#3498DB" />
            <Text style={styles.infoItemText}>Contact Support</Text>
            <Icon name="chevron-right" size={24} color="#BDC3C7" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Ball Sort Puzzle v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ using React Native</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  difficultyContainer: {
    flexDirection: 'row',
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#ECF0F1',
    marginHorizontal: 2,
  },
  difficultyButtonActive: {
    backgroundColor: '#3498DB',
  },
  difficultyText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  difficultyTextActive: {
    color: '#FFF',
  },
  testSoundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#ECF0F1',
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  testSoundsText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#3498DB',
    marginVertical: 4,
  },
  dangerButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  infoItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#BDC3C7',
    marginTop: 4,
  },
});

export default SettingsScreen;