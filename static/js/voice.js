// Project Kisan - Voice Interface JavaScript

class VoiceInterface {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSupported = this.checkSupport();
        
        this.initializeVoice();
    }
    
    checkSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    
    initializeVoice() {
        if (!this.isSupported) {
            console.warn('Speech recognition not supported');
            this.showUnsupportedMessage();
            return;
        }
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = document.getElementById('languageSelect')?.value || 'en-IN';
        
        // Event listeners
        this.recognition.onstart = () => this.onStart();
        this.recognition.onresult = (event) => this.onResult(event);
        this.recognition.onerror = (event) => this.onError(event);
        this.recognition.onend = () => this.onEnd();
        
        // Setup UI event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const voiceBtn = document.getElementById('voiceBtn');
        const languageSelect = document.getElementById('languageSelect');
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleListening());
        }
        
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                if (this.recognition) {
                    this.recognition.lang = e.target.value;
                }
            });
        }
    }
    
    toggleListening() {
        if (!this.isSupported) {
            this.showUnsupportedMessage();
            return;
        }
        
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        if (!this.recognition || this.isListening) return;
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showError('Unable to start voice recognition');
        }
    }
    
    stopListening() {
        if (!this.recognition || !this.isListening) return;
        
        this.recognition.stop();
    }
    
    onStart() {
        this.isListening = true;
        this.updateUI('listening');
        
        // Haptic feedback
        if (window.KisanApp) {
            window.KisanApp.vibrateDevice([100]);
        }
    }
    
    onResult(event) {
        const result = event.results[0];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        console.log('Voice recognition result:', transcript, 'Confidence:', confidence);
        
        if (confidence > 0.6) {
            // Add user message to chat
            if (typeof addUserMessage === 'function') {
                addUserMessage(transcript);
            }
            
            // Process the query
            if (typeof processQuery === 'function') {
                processQuery(transcript);
            }
        } else {
            this.showError('Sorry, I didn\'t understand that. Please try again.');
        }
    }
    
    onError(event) {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = 'Voice recognition error occurred';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not accessible. Please check permissions.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied. Please enable microphone access.';
                break;
            case 'network':
                errorMessage = 'Network error. Please check your connection.';
                break;
            case 'service-not-allowed':
                errorMessage = 'Speech service not available.';
                break;
        }
        
        this.showError(errorMessage);
    }
    
    onEnd() {
        this.isListening = false;
        this.updateUI('idle');
    }
    
    updateUI(state) {
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceStatus = document.getElementById('voiceStatus');
        const micIcon = document.getElementById('micIcon');
        
        if (!voiceBtn || !voiceStatus || !micIcon) return;
        
        switch (state) {
            case 'listening':
                voiceBtn.classList.add('recording');
                voiceStatus.textContent = 'Listening...';
                micIcon.setAttribute('data-feather', 'mic');
                break;
                
            case 'processing':
                voiceBtn.classList.remove('recording');
                voiceStatus.textContent = 'Processing...';
                micIcon.setAttribute('data-feather', 'loader');
                break;
                
            case 'idle':
            default:
                voiceBtn.classList.remove('recording');
                voiceStatus.textContent = 'Tap to speak';
                micIcon.setAttribute('data-feather', 'mic');
                break;
        }
        
        // Re-initialize Feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
    
    speak(text, lang = null) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang || document.getElementById('languageSelect')?.value || 'en-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Find appropriate voice
        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang === utterance.lang || 
            voice.lang.startsWith(utterance.lang.split('-')[0])
        );
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        utterance.onstart = () => {
            console.log('Speech synthesis started');
        };
        
        utterance.onend = () => {
            console.log('Speech synthesis ended');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
        };
        
        this.synthesis.speak(utterance);
    }
    
    showError(message) {
        console.error('Voice interface error:', message);
        
        if (window.KisanApp) {
            window.KisanApp.showNotification(message, 'warning', 4000);
        } else {
            alert(message);
        }
    }
    
    showUnsupportedMessage() {
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceStatus = document.getElementById('voiceStatus');
        
        if (voiceBtn) {
            voiceBtn.disabled = true;
            voiceBtn.style.opacity = '0.5';
        }
        
        if (voiceStatus) {
            voiceStatus.textContent = 'Voice not supported';
        }
        
        this.showError('Voice recognition is not supported in this browser. Please use Chrome or Edge for the best experience.');
    }
    
    // Method to get available voices
    getAvailableVoices() {
        return this.synthesis ? this.synthesis.getVoices() : [];
    }
    
    // Method to set language
    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang;
        }
        
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = lang;
        }
    }
    
    // Method to check if currently listening
    isCurrentlyListening() {
        return this.isListening;
    }
}

// Voice command patterns for different languages
const voiceCommands = {
    'en-IN': {
        weather: ['weather', 'temperature', 'climate', 'rain'],
        price: ['price', 'market', 'cost', 'rate', 'sell'],
        disease: ['disease', 'crop', 'plant', 'leaf', 'sick'],
        scheme: ['scheme', 'subsidy', 'government', 'benefit', 'help'],
        fertilizer: ['fertilizer', 'nutrition', 'soil', 'nutrient']
    },
    'hi-IN': {
        weather: ['मौसम', 'तापमान', 'बारिश', 'धूप'],
        price: ['भाव', 'दाम', 'कीमत', 'मंडी', 'बेचना'],
        disease: ['बीमारी', 'फसल', 'पत्ता', 'रोग'],
        scheme: ['योजना', 'सब्सिडी', 'सरकार', 'लाभ'],
        fertilizer: ['खाद', 'उर्वरक', 'मिट्टी', 'पोषण']
    },
    'ta-IN': {
        weather: ['வானிலை', 'வெப்பநிலை', 'மழை'],
        price: ['விலை', 'மார்க்கெட்', 'விற்க'],
        disease: ['நோய்', 'பயிர்', 'இலை'],
        scheme: ['திட்டம்', 'மானியம்', 'அரசு'],
        fertilizer: ['உரம்', 'மண்', 'ஊட்டச்சத்து']
    }
};

// Initialize voice interface
let voiceInterface;

function initializeVoiceInterface() {
    voiceInterface = new VoiceInterface();
    
    // Load voices when they become available
    if (speechSynthesis) {
        speechSynthesis.onvoiceschanged = () => {
            console.log('Voices loaded:', speechSynthesis.getVoices().length);
        };
    }
}

// Enhanced query processing with voice command recognition
function processVoiceQuery(query, language = 'en-IN') {
    const commands = voiceCommands[language] || voiceCommands['en-IN'];
    const queryLower = query.toLowerCase();
    
    // Check for specific command patterns
    for (const [category, keywords] of Object.entries(commands)) {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
            return handleVoiceCommand(category, query);
        }
    }
    
    // Fallback to general query processing
    return processQuery(query);
}

// Handle specific voice commands
function handleVoiceCommand(category, originalQuery) {
    switch (category) {
        case 'weather':
            if (typeof loadWeatherWidget === 'function') {
                loadWeatherWidget();
            }
            return "Let me check the weather for you...";
            
        case 'price':
            window.location.href = '/market-prices';
            return "Taking you to market prices...";
            
        case 'disease':
            window.location.href = '/crop-diagnosis';
            return "Opening crop diagnosis. Please upload an image of your crop.";
            
        case 'scheme':
            window.location.href = '/schemes';
            return "Opening government schemes information...";
            
        case 'fertilizer':
            return "For fertilizer recommendations, I suggest soil testing first. You can get a soil health card from your nearest agriculture department.";
            
        default:
            return processQuery(originalQuery);
    }
}

// Export for global use
window.VoiceInterface = VoiceInterface;
window.initializeVoiceInterface = initializeVoiceInterface;
window.processVoiceQuery = processVoiceQuery;

// Auto-initialize if on voice query page
if (window.location.pathname === '/voice-query') {
    document.addEventListener('DOMContentLoaded', initializeVoiceInterface);
}
