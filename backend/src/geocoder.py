import os
import requests
from typing import Optional, Dict
import logging

# Configure logic for logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Static list of known cities for instant lookup
# (Also acts as a cache for common demo locations)
CITY_COORDS = {
    "new delhi": {"lat": 28.6139, "lng": 77.2090},
    "mumbai": {"lat": 19.0760, "lng": 72.8777},
    "switzerland": {"lat": 46.8182, "lng": 8.2275},
    "london": {"lat": 51.5074, "lng": -0.1278},
    "new york": {"lat": 40.7128, "lng": -74.0060},
    "paris": {"lat": 48.8566, "lng": 2.3522},
    "tokyo": {"lat": 35.6762, "lng": 139.6503},
    "beijing": {"lat": 39.9042, "lng": 116.4074},
    "sydney": {"lat": -33.8688, "lng": 151.2093},
    "hyderabad": {"lat": 17.3850, "lng": 78.4867},
    "bengaluru": {"lat": 12.9716, "lng": 77.5946},
    "mars": {"lat": 20.5, "lng": -10.5}, # fun easter egg
}

def get_coordinates(city_name: str) -> Optional[Dict[str, float]]:
    """
    Get coordinates for a city using a hybrid approach:
    1. Check static cache.
    2. Try Google Maps API (if key exists).
    3. Fallback to OpenStreetMap (Nominatim).
    """
    normalized_city = city_name.lower().strip()
    
    # 1. Static Cache
    if normalized_city in CITY_COORDS:
        return CITY_COORDS[normalized_city]
        
    google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    
    # 2. Google Maps API
    if google_api_key:
        try:
            url = f"https://maps.googleapis.com/maps/api/geocode/json?address={city_name}&key={google_api_key}"
            response = requests.get(url, timeout=5.0)
            if response.status_code == 200:
                results = response.json().get("results")
                if results:
                    location = results[0]["geometry"]["location"]
                    logger.info(f"Geocoded '{city_name}' via Google Maps")
                    return {
                        "lat": location["lat"],
                        "lng": location["lng"]
                    }
        except Exception as e:
            logger.error(f"Google Maps Geocoding error: {e}")
            # Continue to fallback
            pass
            
    # 3. OpenStreetMap (Nominatim) Fallback
    try:
        # Nominatim requires a user agent
        url = f"https://nominatim.openstreetmap.org/search?q={city_name}&format=json&limit=1"
        headers = {'User-Agent': 'EcoSentinelApp/1.0'}
        response = requests.get(url, headers=headers, timeout=3.0)
        
        if response.status_code == 200:
            results = response.json()
            if results:
                logger.info(f"Geocoded '{city_name}' via OpenStreetMap")
                return {
                    "lat": float(results[0]["lat"]),
                    "lng": float(results[0]["lon"])
                }
    except Exception as e:
        logger.error(f"OSM Geocoding error: {e}")
        
    return None
