import urllib.request
import json
import time

api_key = "AIzaSyDkJ4j-EaSBgvE1e5VT5VABrdqXgh8c3GQ"
project_id = "silksphere-34f61"

# URLs
write_sensor_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/sensor_data/latest?key={api_key}"
read_command_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/device_commands/status?key={api_key}"

def write_sensor(temp, co2, humidity=75.0):
    payload = {
        "fields": {
            "temperature": {"doubleValue": float(temp)},
            "humidity": {"doubleValue": float(humidity)},
            "co2": {"integerValue": int(co2)},
            "nodeStatus": {"stringValue": "Online"},
            "timestamp": {"doubleValue": float(time.time() * 1000)}
        }
    }
    
    req = urllib.request.Request(
        write_sensor_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    
    with urllib.request.urlopen(req) as res:
        print(f"Pushed to Firestore: Temp={temp}°C, CO2={co2} ppm")

def read_commands():
    try:
        with urllib.request.urlopen(read_command_url) as res:
            data = json.loads(res.read().decode('utf-8'))
            fields = data.get("fields", {})
            fan_state = fields.get("fanState", {}).get("booleanValue", False)
            manual_override = fields.get("manualOverride", {}).get("booleanValue", False)
            return {"fanState": fan_state, "manualOverride": manual_override}
    except Exception as e:
        print(f"Error reading commands: {e}")
        return None

# Test Run
print("Starting Closed-Loop Control test...")

# 1. Reset manual override first
urllib.request.urlopen(urllib.request.Request(
    read_command_url,
    data=json.dumps({
        "fields": {
            "manualOverride": {"booleanValue": False},
            "fanState": {"booleanValue": False},
            "timestamp": {"doubleValue": float(time.time() * 1000)}
        }
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='PATCH'
))
print("Manual Override reset to False, Fan state reset to False")

# 2. Push abnormal reading
write_sensor(32.0, 1200)

# Wait a moment for the frontend listener/closed-loop rule to process and write back (simulate 5s delay max)
print("Waiting for closed-loop processing...")
time.sleep(3.0)

cmd = read_commands()
if cmd:
    print(f"Command Status: Fan Active={cmd['fanState']}, Manual Override={cmd['manualOverride']}")
    if cmd['fanState'] == True:
        print("PASS: Automated trigger successfully activated fan State!")
    else:
        print("FAIL: Fan State did not flip to True")
else:
    print("FAIL: Could not read command status")

# 3. Push normal reading
print("\nPushing normal reading...")
write_sensor(25.0, 800)
time.sleep(3.0)

cmd = read_commands()
if cmd:
    print(f"Command Status: Fan Active={cmd['fanState']}, Manual Override={cmd['manualOverride']}")
    if cmd['fanState'] == False:
        print("PASS: Automated trigger successfully deactivated fan State!")
    else:
        print("FAIL: Fan State did not flip back to False")
