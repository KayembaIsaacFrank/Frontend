/**
 * Main Entry Point - Golden Crop Distributors Ltd Frontend
 * 
 * Purpose: Initializes and renders the React application
 * - Sets up dark theme by default
 * - Imports Bootstrap CSS and JavaScript
 * - Creates React root and mounts App component
 * - Wraps app in React.StrictMode for development checks
 * 
 * Dependencies:
 * - React: UI library
 * - ReactDOM: React rendering for web
 * - Bootstrap: CSS framework for styling
 */

// Set default theme to dark mode for better UI experience
document.body.setAttribute('data-theme', 'dark');

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'      // Bootstrap CSS framework
import 'bootstrap/dist/js/bootstrap.bundle.min.js'  // Bootstrap JavaScript components

// Create React root and render the App component
// StrictMode enables additional development checks and warnings
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
