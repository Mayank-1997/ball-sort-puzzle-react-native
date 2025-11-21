import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('ballsortpuzzlern', () => App);

// Get the root element
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app
AppRegistry.runApplication('ballsortpuzzlern', {
  rootTag: container,
});