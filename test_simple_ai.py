import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv('frontend/.env.local')
API_KEY = os.getenv("GOOGLE_API_KEY")

print(f"Key: {API_KEY[:5]}..." if API_KEY else "Key Custom Missing")

if API_KEY:
    genai.configure(api_key=API_KEY)
    try:
        print("Listing models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"Model: {m.name}")
        
        print("Testing Generation...")
        model = genai.GenerativeModel('gemini-pro')
        res = model.generate_content("Hello")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No API Key found")
