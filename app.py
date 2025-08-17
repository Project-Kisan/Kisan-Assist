import os
import logging
import requests
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "kisan_dev_secret_key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/crop-diagnosis')
def crop_diagnosis():
    """Crop diagnosis page"""
    return render_template('crop_diagnosis.html')

@app.route('/market-prices')
def market_prices():
    """Market prices page"""
    return render_template('market_prices.html')

@app.route('/voice-query')
def voice_query():
    """Voice query page"""
    return render_template('voice_query.html')

@app.route('/schemes')
def schemes():
    """Government schemes page"""
    return render_template('schemes.html')

@app.route('/api/upload_crop', methods=['POST'])
def upload_crop():
    """
    Placeholder endpoint for crop disease diagnosis
    Returns dummy results until real AI model is integrated
    """
    try:
        if 'crop_image' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400
        
        file = request.files['crop_image']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400
        
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Placeholder response - will be replaced with real AI model
            placeholder_diseases = [
                {
                    'disease': 'Leaf Blight',
                    'remedy': 'Apply copper-based fungicide spray. Remove affected leaves and improve air circulation.',
                    'confidence': 0.85,
                    'severity': 'moderate'
                },
                {
                    'disease': 'Bacterial Wilt',
                    'remedy': 'Use resistant varieties. Improve drainage and avoid overhead watering.',
                    'confidence': 0.78,
                    'severity': 'high'
                },
                {
                    'disease': 'Healthy Crop',
                    'remedy': 'Continue current care practices. Monitor regularly for any changes.',
                    'confidence': 0.92,
                    'severity': 'none'
                }
            ]
            
            # Return a random placeholder result
            import random
            result = random.choice(placeholder_diseases)
            
            return jsonify({
                'status': 'success',
                'disease': result['disease'],
                'remedy': result['remedy'],
                'confidence': result['confidence'],
                'severity': result['severity'],
                'image_path': f'/static/uploads/{filename}'
            })
        
        return jsonify({'status': 'error', 'message': 'Invalid file type'}), 400
        
    except Exception as e:
        logging.error(f"Error in crop diagnosis: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

@app.route('/api/get_market_price')
def get_market_price():
    """Get market prices from Mandi API"""
    try:
        # Get query parameters
        commodity = request.args.get('commodity', 'rice')
        state = request.args.get('state', 'all')
        
        # Try to fetch from Mandi API
        api_key = os.environ.get('MANDI_API_KEY', '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b')
        
        # Placeholder URL - replace with actual Mandi API endpoint
        mandi_api_url = f"https://api.data.gov.in/resource/market-price"
        
        try:
            headers = {'api-key': api_key}
            params = {
                'format': 'json',
                'limit': 100,
                'filters[commodity]': commodity,
                'filters[state]': state if state != 'all' else ''
            }
            
            response = requests.get(mandi_api_url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return jsonify({
                    'status': 'success',
                    'data': data
                })
            else:
                # Fallback to dummy data if API fails
                raise Exception("API request failed")
                
        except Exception as api_error:
            logging.warning(f"Mandi API error: {str(api_error)}, using fallback data")
            
            # Fallback dummy data for demonstration
            fallback_data = {
                'records': [
                    {
                        'commodity': commodity.title(),
                        'market': 'Local Market',
                        'min_price': '2000',
                        'max_price': '2500',
                        'modal_price': '2250',
                        'state': 'Karnataka',
                        'district': 'Bangalore',
                        'arrival_date': datetime.now().strftime('%Y-%m-%d')
                    }
                ]
            }
            
            return jsonify({
                'status': 'success',
                'data': fallback_data,
                'note': 'Using fallback data due to API unavailability'
            })
            
    except Exception as e:
        logging.error(f"Error fetching market prices: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Unable to fetch market prices at this time'
        }), 500

@app.route('/api/get_weather')
def get_weather():
    """Get weather data from OpenWeather API"""
    try:
        city = request.args.get('city', 'Bangalore')
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        api_key = os.environ.get('OPENWEATHER_API_KEY', '20e391558fc8b590fa358abb523beec5')
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather"
            
            if lat and lon:
                params = {
                    'lat': lat,
                    'lon': lon,
                    'appid': api_key,
                    'units': 'metric'
                }
            else:
                params = {
                    'q': city,
                    'appid': api_key,
                    'units': 'metric'
                }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return jsonify({
                    'status': 'success',
                    'weather': {
                        'temperature': data['main']['temp'],
                        'humidity': data['main']['humidity'],
                        'description': data['weather'][0]['description'],
                        'wind_speed': data['wind']['speed']
                    }
                })
            else:
                # Fallback to dummy data if API fails
                raise Exception("Weather API request failed")
                
        except Exception as api_error:
            logging.warning(f"Weather API error: {str(api_error)}, using fallback data")
            
            # Fallback dummy weather data for demonstration
            import random
            fallback_weather = {
                'temperature': round(25 + random.uniform(-5, 10), 1),  # 20-35°C range
                'humidity': random.randint(45, 85),  # 45-85% humidity
                'description': random.choice(['clear sky', 'few clouds', 'partly cloudy', 'light rain']),
                'wind_speed': round(random.uniform(2, 15), 1)  # 2-15 m/s wind speed
            }
            
            return jsonify({
                'status': 'success',
                'weather': fallback_weather,
                'note': 'Using fallback weather data for local development'
            })
            
    except Exception as e:
        logging.error(f"Weather API error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Unable to fetch weather data'
        }), 500

@app.route('/api/get_scheme')
def get_scheme():
    """Get government scheme information"""
    try:
        scheme_type = request.args.get('type', 'all')
        
        # Static scheme data - in production, this would come from a database
        schemes = [
            {
                'id': 1,
                'name': 'PM-KISAN',
                'description': 'Direct income support to farmers',
                'benefit': '₹6000 per year in 3 installments',
                'eligibility': 'All landholding farmers',
                'how_to_apply': 'Visit nearest CSC or apply online at pmkisan.gov.in',
                'type': 'income_support'
            },
            {
                'id': 2,
                'name': 'Crop Insurance Scheme',
                'description': 'Insurance coverage for crop losses',
                'benefit': 'Coverage up to sum insured',
                'eligibility': 'All farmers growing notified crops',
                'how_to_apply': 'Contact nearest bank or insurance company',
                'type': 'insurance'
            },
            {
                'id': 3,
                'name': 'Soil Health Card',
                'description': 'Free soil testing and recommendations',
                'benefit': 'Soil nutrient status and fertilizer recommendations',
                'eligibility': 'All farmers',
                'how_to_apply': 'Visit nearest agriculture department office',
                'type': 'advisory'
            }
        ]
        
        if scheme_type != 'all':
            schemes = [s for s in schemes if s['type'] == scheme_type]
        
        return jsonify({
            'status': 'success',
            'schemes': schemes
        })
        
    except Exception as e:
        logging.error(f"Error fetching schemes: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Unable to fetch scheme information'
        }), 500

@app.route('/api/voice_query', methods=['POST'])
def voice_query_api():
    """Handle voice queries from farmers"""
    try:
        data = request.get_json()
        query = data.get('query', '').lower()
        language = data.get('language', 'english')
        
        # Simple keyword-based responses
        # In production, this would use an LLM like Gemini
        responses = {
            'weather': 'Today\'s weather shows good conditions for farming. Temperature is moderate with no rain expected.',
            'price': 'Current market prices are favorable. Rice is trading at ₹2250 per quintal.',
            'disease': 'For crop disease diagnosis, please upload a clear image of the affected plant.',
            'scheme': 'Several government schemes are available including PM-KISAN for direct income support.',
            'fertilizer': 'Based on current season, apply balanced NPK fertilizer. Consider soil testing first.'
        }
        
        # Simple keyword matching
        response_text = "I'm here to help with your farming questions. You can ask about weather, market prices, crop diseases, or government schemes."
        
        for keyword, response in responses.items():
            if keyword in query:
                response_text = response
                break
        
        return jsonify({
            'status': 'success',
            'response': response_text,
            'language': language
        })
        
    except Exception as e:
        logging.error(f"Voice query error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Unable to process voice query'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
