from groq import Groq
import os

API_KEY = os.environ.get("GROQ_API_KEY")

print(f"Key: {API_KEY[:10]}...")

try:
    print("Initializing Client...")
    client = Groq(api_key=API_KEY)
    
    print("Sending request...")
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
        model="llama-3.1-8b-instant",
    )
    print(f"Response: {chat_completion.choices[0].message.content}")

except Exception as e:
    print(f"Groq Error: {e}")
