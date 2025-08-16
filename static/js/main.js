// Project Kisan - Main JavaScript Functions

// Global variables
let isOnline = navigator.onLine;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// App initialization
function initializeApp() {
    // Update online status
    updateOnlineStatus();
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initialize PWA functionality
    initializePWA();
    
    // Initialize dashboard specific features
    if (document.getElementById('priceChart')) {
        initializeDashboard();
    }
}

// Dashboard initialization
function initializeDashboard() {
    // Initialize price chart on dashboard
    initializeDashboardChart();
    
    // Load weather widget
    loadWeatherWidget();
    
    // Set up crop image upload
    setupCropImageUpload();
}

// Initialize dashboard price chart
function initializeDashboardChart() {
    const chartCanvas = document.getElementById('priceChart');
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Sample market data for dashboard
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = generateSamplePriceData();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Market Price',
                data: data,
                borderColor: '#2d5530',
                backgroundColor: 'rgba(45, 85, 48, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2d5530',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            },
            elements: {
                line: {
                    capBezierPoints: false
                }
            }
        }
    });
}

// Generate sample price data
function generateSamplePriceData() {
    const basePrice = 2200;
    const data = [];
    
    for (let i = 0; i < 7; i++) {
        const variation = (Math.random() - 0.5) * 400;
        data.push(Math.round(basePrice + variation));
    }
    
    return data;
}

// Load weather widget
function loadWeatherWidget() {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;
    
    // Get user's location (fallback to Bangalore)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherByCoords(lat, lon);
            },
            error => {
                console.log('Geolocation error:', error);
                fetchWeatherByCity('Bangalore');
            }
        );
    } else {
        fetchWeatherByCity('Bangalore');
    }
}

// Fetch weather by coordinates
function fetchWeatherByCoords(lat, lon) {
    fetch(`/api/get_weather?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => {
            console.error('Weather fetch error:', error);
            displayWeatherError();
        });
}

// Fetch weather by city name
function fetchWeatherByCity(city) {
    fetch(`/api/get_weather?city=${encodeURIComponent(city)}`)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => {
            console.error('Weather fetch error:', error);
            displayWeatherError();
        });
}

// Display weather information
function displayWeather(data) {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;
    
    if (data.status === 'success') {
        const weather = data.weather;
        weatherWidget.innerHTML = `
            <div class="weather-info">
                <div class="weather-item">
                    <div class="weather-value">${Math.round(weather.temperature)}°C</div>
                    <div class="weather-label">Temperature</div>
                </div>
                <div class="weather-item">
                    <div class="weather-value">${weather.humidity}%</div>
                    <div class="weather-label">Humidity</div>
                </div>
            </div>
            <div class="mt-2 text-center">
                <small>${weather.description}</small>
            </div>
        `;
    } else {
        displayWeatherError();
    }
}

// Display weather error
function displayWeatherError() {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;
    
    weatherWidget.innerHTML = `
        <div class="alert alert-warning">
            <i data-feather="cloud-off"></i>
            Weather data unavailable
        </div>
    `;
    
    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// Setup crop image upload on dashboard
function setupCropImageUpload() {
    const cropImageInput = document.getElementById('cropImageInput');
    if (!cropImageInput) return;
    
    cropImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Redirect to crop diagnosis page with file info
            sessionStorage.setItem('pendingCropImage', 'true');
            window.location.href = '/crop-diagnosis';
        }
    });
}

// PWA Installation
function initializePWA() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });
    
    window.addEventListener('appinstalled', (evt) => {
        console.log('PWA was installed');
        hideInstallButton();
    });
}

// Show install button
function showInstallButton() {
    // Create install button if it doesn't exist
    let installButton = document.getElementById('installButton');
    if (!installButton) {
        installButton = document.createElement('button');
        installButton.id = 'installButton';
        installButton.className = 'btn btn-outline-success position-fixed';
        installButton.style.cssText = 'bottom: 90px; right: 20px; z-index: 1000;';
        installButton.innerHTML = '<i data-feather="download"></i> Install App';
        document.body.appendChild(installButton);
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
    
    installButton.style.display = 'block';
    installButton.addEventListener('click', installPWA);
}

// Hide install button
function hideInstallButton() {
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'none';
    }
}

// Install PWA
async function installPWA() {
    const installButton = document.getElementById('installButton');
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }
    
    deferredPrompt = null;
    hideInstallButton();
}

// Online/Offline handling
function handleOnline() {
    isOnline = true;
    updateOnlineStatus();
    showNotification('Connection restored', 'success');
}

function handleOffline() {
    isOnline = false;
    updateOnlineStatus();
    showNotification('You are offline. Some features may be limited.', 'warning');
}

function updateOnlineStatus() {
    const statusIcon = document.querySelector('.status-icons .wifi-icon');
    if (statusIcon) {
        statusIcon.style.opacity = isOnline ? '1' : '0.5';
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.app-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} app-notification position-fixed fade-in`;
    notification.style.cssText = 'top: 20px; left: 20px; right: 20px; z-index: 9999; margin: 0;';
    notification.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
            <span>${message}</span>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

// Format currency
function formatCurrency(amount, currency = '₹') {
    return `${currency}${parseFloat(amount).toLocaleString('en-IN')}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Check if device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Vibrate device (if supported)
function vibrateDevice(pattern = [100]) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success', 2000);
        vibrateDevice([50]);
    } catch (err) {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', 'danger', 2000);
    }
}

// Share content
async function shareContent(title, text, url) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: text,
                url: url
            });
        } catch (err) {
            console.error('Error sharing:', err);
            // Fallback to copy to clipboard
            copyToClipboard(url || text);
        }
    } else {
        // Fallback for browsers that don't support Web Share API
        copyToClipboard(url || text);
    }
}

// Local storage helpers
function setLocalData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
        console.error('Error saving to local storage:', err);
    }
}

function getLocalData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Error reading from local storage:', err);
        return null;
    }
}

// Image compression
function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    
    // Show user-friendly error message
    if (!isOnline) {
        showNotification('Please check your internet connection', 'warning');
    } else {
        showNotification('Something went wrong. Please try again.', 'danger');
    }
});

// Prevent zoom on double-tap (iOS Safari)
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Export functions for use in other files
window.KisanApp = {
    showNotification,
    formatCurrency,
    formatDate,
    isMobileDevice,
    vibrateDevice,
    copyToClipboard,
    shareContent,
    setLocalData,
    getLocalData,
    compressImage
};
