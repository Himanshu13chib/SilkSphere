import urllib.request
import json
import sys

url = "http://127.0.0.1:8000/predict-batch-state"

def get_prediction(temp_vals, hum_vals, co2_vals, ai_score=100.0):
    sensor_history = []
    for i in range(24):
        sensor_history.append({
            "temp": temp_vals[i % len(temp_vals)],
            "humidity": hum_vals[i % len(hum_vals)],
            "co2": co2_vals[i % len(co2_vals)],
            "timestamp": 1718974800.0 + i * 3600
        })

    payload = {
        "current_stage": "Instar 3",
        "days_in_stage": 1.5,
        "sensor_history": sensor_history,
        "ai_health_score": ai_score
    }

    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Request failed: {e}")
        return None

print("Testing Predictive Endpoint Variations...")

# Test 1: Excellent/Optimal Conditions (Instar 3 Ideal: Temp 26C, Hum 78%, CO2 950ppm)
temp_good = [25.8, 26.1, 26.0, 25.9]
hum_good = [77.5, 78.2, 77.0, 78.0]
co2_good = [920, 950, 930, 940]
res_good = get_prediction(temp_good, hum_good, co2_good, ai_score=98.0)

# Test 2: Severe Environmental Stress (Temp 33C, Humidity 92%, CO2 1800ppm)
temp_bad = [32.5, 33.2, 32.8, 33.0]
hum_bad = [90.5, 92.1, 91.0, 91.5]
co2_bad = [1750, 1850, 1780, 1820]
res_bad = get_prediction(temp_bad, hum_bad, co2_bad, ai_score=98.0)

if res_good and res_bad:
    print(f"Good Environment Result: Grade={res_good['expected_cocoon_grade']}, Compliance={res_good['env_compliance_score']}%")
    print(f"Bad Environment Result: Grade={res_bad['expected_cocoon_grade']}, Compliance={res_bad['env_compliance_score']}%")
    
    if res_good['expected_cocoon_grade'] != res_bad['expected_cocoon_grade']:
        print("PASS: Expected cocoon grade varies based on environmental inputs!")
    else:
        print("FAIL: Expected cocoon grade is static!")
        
    if res_good['env_compliance_score'] > res_bad['env_compliance_score']:
        print("PASS: Compliance score varies properly!")
    else:
        print("FAIL: Compliance score did not vary correctly!")
else:
    print("FAIL: Failed to get prediction results")
    sys.exit(1)
