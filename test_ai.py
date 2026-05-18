import sys
import os

# Ensure src is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

try:
    from backend.src.ai_engine import generate_advisory
    
    data = {
        "zone": "TestZone",
        "pm25": 150,
        "aqi": 200,
        "z_score": 4.5
    }
    
    print("Testing generate_advisory...")
    res = generate_advisory(data)
    print(f"Result: {res}")
except ImportError as e:
    print(f"Import Error: {e}")
    # Try alternate import path structure if running from root
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
    try:
        from backend.src.ai_engine import generate_advisory
        res = generate_advisory(data)
        print(f"Result (Retry): {res}")
    except Exception as e2:
        print(f"Retry Error: {e2}")
except Exception as e3:
    print(f"Runtime Error: {e3}")
