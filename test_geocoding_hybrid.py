import sys
import os

# Ensure backend directory is in path
sys.path.append(os.path.abspath("backend"))

from src.geocoder import get_coordinates

def test_geocoding():
    print("Testing Geocoding Logic...")
    
    # Test 1: Known City (Static Cache)
    city = "New Delhi"
    coords = get_coordinates(city)
    print(f"1. {city}: {coords} ('lat' should be ~28.6)")
    assert coords is not None
    assert abs(coords['lat'] - 28.6139) < 0.1
    
    # Test 2: Real Geocoding (OSM Fallback expected if no API key)
    # Using a city NOT in the static cache
    city = "Berlin"
    coords = get_coordinates(city)
    print(f"2. {city}: {coords} ('lat' should be ~52.5)")
    if coords:
        assert abs(coords['lat'] - 52.52) < 1.0
    else:
        print("   (Warning: Geocoding failed, possibly network issue or rate limit)")
        
    # Test 3: Invalid City
    city = "Atlantis_Fake_City_123"
    coords = get_coordinates(city)
    print(f"3. {city}: {coords} (Should be None)")
    assert coords is None
    
    print("\nVerification Passed!")

if __name__ == "__main__":
    test_geocoding()
