/**
 * NeuralSign Entry Point
 * React application initialization
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Import global styles
import '@/styles/globals.css';

// Initialize app
createRoot(document.getElementById('root')).render(
  <App />
);
