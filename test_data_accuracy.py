import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from ai_agent.WarningSystem.src import ingestion
import statistics

def test_delhi_simulation():
    print("Testing New Delhi Simulation Override...")
    data = ingestion.generate_simulated_data(100, city_name="New Delhi")
    mean = statistics.mean(data)
    print(f"New Delhi Mean PM2.5: {mean:.2f}")
    
    if mean > 300:
        print("SUCCESS: New Delhi is correctly simulating HAZARDOUS levels.")
    else:
        print("FAILURE: New Delhi is showing moderate levels.")

def test_london_simulation():
    print("\nTesting London Simulation Override...")
    data = ingestion.generate_simulated_data(100, city_name="London")
    mean = statistics.mean(data)
    print(f"London Mean PM2.5: {mean:.2f}")

    if mean < 50:
        print("SUCCESS: London is correctly simulating GOOD levels.")
    else:
        print("FAILURE: London is too polluted.")

if __name__ == "__main__":
    test_delhi_simulation()
    test_london_simulation()
