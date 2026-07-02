# Arduino Sensor Integration Guide

## Overview
This guide explains how to integrate real Arduino sensor readings into your SilkSphere project.

## 📋 Hardware Requirements

### Option 1: Basic Setup
- **Microcontroller**: ESP32 or ESP8266 (WiFi capable)
- **Temperature & Humidity**: DHT22 sensor
- **CO2/Gas**: MQ-135 sensor
- **Wiring**: Jumper wires, breadboard

### Option 2: Advanced Multi-Zone Setup
- Multiple ESP32 boards (one per zone)
- 4x DHT22 sensors
- 4x MQ-135 sensors
- Each zone sensor node reports independently

---

## 🔌 Wiring Diagram

### ESP32 + DHT22 + MQ135

```
DHT22:
  VCC → 3.3V
  GND → GND
  DATA → GPIO 4

MQ-135:
  VCC → 5V (or 3.3V)
  GND → GND
  AOUT → GPIO 34 (Analog input)
```

---

## 💻 Software Setup

### Step 1: Install Arduino Libraries

Open Arduino IDE and install these libraries:
1. **WiFi** (Built-in for ESP32)
2. **HTTPClient** (Built-in for ESP32)
3. **DHT sensor library** by Adafruit
4. **ArduinoJson** by Benoit Blanchon

**Installation:**
- Go to: `Sketch` → `Include Library` → `Manage Libraries`
- Search and install each library

---

### Step 2: Configure Arduino Code

1. Open `backend/arduino_firmware.ino` in Arduino IDE

2. **Update WiFi credentials:**
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

3. **Update backend URL:**
```cpp
// If backend is on your computer:
const char* serverUrl = "http://192.168.1.100:8000/sensor-data";

// Replace 192.168.1.100 with your computer's local IP address
// Find it using: ipconfig (Windows) or ifconfig (Mac/Linux)
```

4. **Upload to ESP32:**
   - Connect ESP32 via USB
   - Select: `Tools` → `Board` → `ESP32 Dev Module`
   - Select correct COM port: `Tools` → `Port`
   - Click **Upload** button

---

### Step 3: Test Arduino Connection

1. **Open Serial Monitor** in Arduino IDE (`Tools` → `Serial Monitor`)
2. Set baud rate to **115200**
3. You should see:
```
=================================
SilkSphere IoT Sensor Node v1.0
=================================
[✓] DHT22 sensor initialized
[*] Connecting to WiFi: YourWiFi
[✓] WiFi connected!
[*] IP Address: 192.168.1.105

--- Sensor Readings ---
Temperature: 25.3°C
Humidity: 78.5%
CO2: 920 ppm
[*] Sending data to backend...
[✓] Response code: 200
```

---

## 🖥️ Backend Setup

The backend API endpoints are already configured!

### Endpoints:

1. **POST /sensor-data** - Receives data from Arduino
2. **GET /sensor-data/latest** - Frontend calls this to get real sensor data

### Test Backend:

```bash
# Test manually with curl:
curl -X POST http://localhost:8000/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 25.5,
    "humidity": 78.0,
    "co2": 950,
    "node_id": "TEST-001"
  }'
```

---

## 🧪 Testing Without Arduino (Simulator)

If you don't have Arduino hardware yet, use the simulator:

```bash
cd backend
python arduino_simulator.py
```

This will send realistic sensor data to your backend every 5 seconds.

---

## 🔄 Update Frontend to Use Real Data

### Option 1: Poll Backend Every 5 Seconds

Update `src/context/AppContext.jsx` to fetch real data:

```javascript
// Replace publishMockSensorData with this:
const fetchRealSensorData = useCallback(async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/sensor-data/latest`)
    if (res.ok) {
      const data = await res.json()
      setLiveSensor(data)
      
      // Also update Firestore for other features
      await setDoc(doc(db, 'sensor_data', 'latest'), data)
    }
  } catch (err) {
    console.warn("Error fetching sensor data:", err.message)
  }
}, [])

// Replace the interval in useEffect:
useEffect(() => {
  const t = setInterval(() => {
    fetchRealSensorData()
  }, 5000)  // Poll every 5 seconds
  fetchRealSensorData()  // Initial fetch
  return () => clearInterval(t)
}, [fetchRealSensorData])
```

### Option 2: WebSocket (Real-time, Advanced)

For instant updates without polling, implement WebSocket connection.

---

## 📊 Multi-Zone Support

If you have multiple sensor nodes for different zones:

### Arduino Side:
Each ESP32 sends data with unique `node_id`:
```cpp
doc["node_id"] = "ESP32-ZoneA";  // ZoneA, ZoneB, ZoneC, ZoneD
```

### Backend Side:
Already supports zones! Send this structure:
```json
{
  "temperature": 25.5,
  "humidity": 78.0,
  "co2": 950,
  "zones": {
    "Zone A": {"temperature": 25.5, "humidity": 78.0, "co2": 950},
    "Zone B": {"temperature": 26.0, "humidity": 77.0, "co2": 920},
    "Zone C": {"temperature": 25.8, "humidity": 78.5, "co2": 940},
    "Zone D": {"temperature": 25.3, "humidity": 79.0, "co2": 910}
  }
}
```

---

## 🔧 Troubleshooting

### Arduino Can't Connect to WiFi
- ✅ Check SSID and password are correct
- ✅ Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- ✅ Check WiFi signal strength

### Backend Not Receiving Data
- ✅ Ensure backend is running: `python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- ✅ Check firewall isn't blocking port 8000
- ✅ Use correct local IP address (not localhost on Arduino)
- ✅ Arduino and computer must be on same network

### Sensor Readings Are Wrong
- ✅ DHT22: Wait 2 seconds between readings
- ✅ MQ-135: Needs 24-48 hours pre-heating for accurate CO2
- ✅ Calibrate MQ-135 using the map() function

### Frontend Still Shows Mock Data
- ✅ Update AppContext.jsx as shown above
- ✅ Clear browser cache
- ✅ Check browser console for errors

---

## 🚀 Next Steps

1. ✅ **Test with simulator first** - Make sure backend receives data
2. ✅ **Connect Arduino** - Upload firmware and test
3. ✅ **Verify data flow** - Check Serial Monitor → Backend logs → Frontend
4. ✅ **Deploy to production** - Use real sensors in sericulture environment
5. ✅ **Add alerts** - Set up notifications for threshold violations

---

## 📝 Data Storage Options

### Option 1: File-based (Current)
- Data saved to `backend/sensor_log.txt`
- Simple, no database required
- Good for prototyping

### Option 2: Firebase Firestore (Recommended)
- Already integrated in your project
- Real-time sync across devices
- Cloud storage

### Option 3: Database (Production)
- PostgreSQL, MySQL, or MongoDB
- Better for large-scale data
- Requires additional setup

---

## 📞 Need Help?

- Check Arduino Serial Monitor for connection logs
- Check backend terminal for incoming requests
- Check browser console for frontend errors
- Review sensor wiring connections

**Common URLs:**
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- Sensor endpoint: `http://localhost:8000/sensor-data`
- Latest data: `http://localhost:8000/sensor-data/latest`
