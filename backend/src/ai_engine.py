import os
from groq import Groq
from dotenv import load_dotenv

# Try to load env specific to backend, or fallback to frontend/root
current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_env_path = os.path.join(current_dir, '..', '..', 'frontend', '.env.local')

if os.path.exists(frontend_env_path):
    load_dotenv(frontend_env_path)
else:
    load_dotenv() 

# Use user provided Groq key
API_KEY = os.environ.get("GROQ_API_KEY")

if not API_KEY:
    print("Warning: GROQ_API_KEY not found.")

def generate_advisory(data):
    """
    Generates an AI advisory based on pollution data using Groq (Llama 3).
    Input: data (dict) containing 'pm25', 'aqi', 'no2', etc.
    Output: str - The advisory text.
    """
    if not API_KEY:
        return "AI Error: API Key missing."

    pm25 = data.get("pm25", 0)
    aqi = data.get("aqi", 0)
    zone = data.get("zone", "Unknown Zone")
    
    # Construct the prompt
    prompt = f"""
    You are the 'Eco-Sentinel', an advanced planetary defense AI monitoring environmental health.
    
    Current Telemetry for zone '{zone}':
    - PM2.5: {pm25} µg/m³
    - AQI: {aqi}
    
    Analyze this data.
    If levels are hazardous (AQI > 300 or PM2.5 > 100), issue a critical warning.
    If moderate, issue a caution.
    If clean, issue a status normal report.
    
    Output a SINGLE, brief, sci-fi style sentence (max 20 words).
    Do not include markdown or prefixes like "Advisory:". Just the message.
    """
    
    try:
        client = Groq(api_key=API_KEY)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "AI System Error: Neural link unstable (Groq)."
