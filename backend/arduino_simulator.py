#!/usr/bin/env python3
"""
Arduino Sensor Simulator
Run this to test the sensor endpoint without actual Arduino hardware
Simulates realistic sensor readings and sends them to the backend

Usage: python arduino_simulator.py
"""

import requests
import time
import random
import json
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000/sensor-data"
UPDATE_INTERVAL = 5  # seconds
NODE_ID = "SIMULATOR-001"

def generate_sensor_data():
    """Generate realistic sensor readings"""
    # Simulate realistic variations
    base_temp = 25.0
    base_humidity = 78.0
    base_co2 = 900
    
    temperature = round(base_temp + random.uniform(-1.5, 1.5), 1)
    humidity = round(base_humidity + random.uniform(-3, 3), 1)
    co2 = int(base_co2 + random.randint(-100, 100))
    
    # Occasionally simulate anomalies
    if random.random() < 0.1:  # 10% chance of anomaly
        if random.random() < 0.5:
            temperature += random.uniform(1.5, 3.0)  # Temperature spike
        else:
            co2 += random.randint(150, 300)  # CO2 spike
    
    return {
        "temperature": temperature,
        "humidity": humidity,
        "co2": co2,
        "timestamp": time.time(),
        "node_id": NODE_ID
    }

def generate_multi_zone_data():
    """Generate data for multiple zones"""
    zones = {}
    for zone_name in ["Zone A", "Zone B", "Zone C", "Zone D"]:
        base_temp = 25.0 + random.uniform(-0.5, 0.5)
        base_humidity = 78.0 + random.uniform(-2, 2)
        base_co2 = 900 + random.randint(-50, 50)
        
        zones[zone_name] = {
            "temperature": round(base_temp + random.uniform(-0.8, 0.8), 1),
            "humidity": round(base_humidity + random.uniform(-2, 2), 1),
            "co2": int(base_co2 + random.randint(-50, 50))
        }
    
    return zones

def send_sensor_data():
    """Send sensor data to backend"""
    try:
        data = generate_sensor_data()
        
        # Add multi-zone data
        data["zones"] = generate_multi_zone_data()
        
        response = requests.post(BACKEND_URL, json=data, timeout=5)
        
        if response.status_code == 200:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ✓ Data sent: Temp={data['temperature']}°C, "
                  f"Humidity={data['humidity']}%, CO2={data['co2']} ppm")
        else:
            print(f"[✗] Error: {response.status_code} - {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("[✗] Connection error - Is the backend running on http://localhost:8000?")
    except Exception as e:
        print(f"[✗] Error: {e}")

def main():
    print("=" * 60)
    print("SilkSphere Arduino Sensor Simulator")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Update interval: {UPDATE_INTERVAL} seconds")
    print(f"Node ID: {NODE_ID}")
    print("=" * 60)
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            send_sensor_data()
            time.sleep(UPDATE_INTERVAL)
    except KeyboardInterrupt:
        print("\n\n[*] Simulator stopped")

if __name__ == "__main__":
    main()
