# Project Kisan - Farmer's Digital Assistant

## Overview

Project Kisan is a Progressive Web Application (PWA) designed as a comprehensive digital assistant for farmers. The application provides AI-powered crop diagnosis through image analysis, real-time market price information, voice-based query assistance, and access to government agricultural schemes. Built with Flask and modern web technologies, it offers a mobile-first experience with offline capabilities to serve farmers in areas with limited internet connectivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application follows a mobile-first, responsive design pattern using Bootstrap 5 as the primary CSS framework. The frontend is organized as a multi-page application with dedicated pages for each major feature:

- **Template Structure**: Jinja2 templates with shared layouts and components
- **Progressive Web App**: Implements PWA standards with service workers and manifest for offline functionality
- **Icon System**: Feather Icons for consistent UI elements
- **Responsive Design**: Mobile-optimized layouts with touch-friendly interfaces

### Backend Architecture
The application uses Flask as the web framework with a modular route-based architecture:

- **Main Application**: Single Flask application (`app.py`) with route handlers for each feature
- **File Upload Handling**: Secure file upload system for crop image diagnosis
- **Session Management**: Flask sessions for user state management
- **Static Asset Serving**: Direct static file serving for CSS, JavaScript, and uploaded images

### Core Features
1. **Crop Diagnosis**: Image upload and analysis system for crop disease detection
2. **Market Prices**: Real-time agricultural commodity price display with filtering
3. **Voice Interface**: Speech recognition and synthesis for voice-based queries
4. **Government Schemes**: Information portal for agricultural schemes and subsidies
5. **Dashboard**: Centralized overview with weather widgets and price charts

### Client-Side Architecture
- **Voice Interface**: Web Speech API integration for multilingual voice commands
- **Chart Visualization**: Client-side data visualization for price trends
- **Offline Support**: Service worker implementation for PWA functionality
- **File Upload**: Client-side image preview and validation before server upload

### Security Considerations
- **File Upload Security**: Filename sanitization and file type validation
- **Session Security**: Environment-based secret key configuration
- **Content Security**: File size limits and secure upload directory management

## External Dependencies

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework for responsive design and UI components
- **Feather Icons**: Icon library for consistent visual elements
- **Web Speech API**: Browser-native speech recognition and synthesis

### Backend Dependencies
- **Flask**: Python web framework for application structure
- **Werkzeug**: WSGI utilities for secure file uploads and proxy handling
- **Requests**: HTTP library for external API communication (market data, weather)

### Browser APIs
- **Service Worker API**: For PWA offline functionality
- **Web Speech API**: Voice recognition and text-to-speech capabilities
- **File API**: Client-side file handling and preview
- **Canvas API**: Chart rendering and image manipulation

### Potential External Services
- **Agricultural Market APIs**: For real-time commodity pricing data
- **Weather APIs**: For location-based weather information
- **AI/ML Services**: For crop disease diagnosis and image analysis
- **Government Data APIs**: For scheme information and subsidies

### Development Tools
- **Python 3.x**: Runtime environment
- **Modern Web Browsers**: Chrome, Firefox, Safari for PWA support
- **Mobile Browsers**: Optimized for Android and iOS mobile browsers