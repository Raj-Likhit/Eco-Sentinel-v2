from google import genai
import os
from dotenv import load_dotenv

# Hardcoded for test
API_KEY = "AIzaSyDyTmmL8X1lzhPUoL4BDBMia8pfYDS9b0A"

print(f"Key: {API_KEY[:5]}..." if API_KEY else "No Key")

try:
    print("Initializing Client...")
    client = genai.Client(api_key=API_KEY)
    
    print("\nTesting gemini-1.5-flash-001...")
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash-001', 
            contents='Status check.'
        )
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Flash Failed: {e}")

except Exception as e:
    print(f"Error: {e}")
