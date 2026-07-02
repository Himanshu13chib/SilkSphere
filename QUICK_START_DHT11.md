# Quick Start Guide - DHT11 + ESP32 Integration

## Your Current Setup
- ✅ ESP32 board
- ✅ DHT11 sensor (GPIO 23)
- ✅ Buzzer (GPIO 25)
- ✅ Arduino IDE with working code

---

## 🚀 3-Step Integration

### Step 1: Find Your Computer's IP Address

**Windows:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Type `ipconfig` and press Enter
4. Find "IPv4 Address" (looks like: `192.168.1.100`)
5. **Write it down!** You'll need it in Step 2.

**Example output:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

---

### Step 2: Update Arduino Code

1. **Open** `backend/esp32_dht11_simple.ino` in Arduino IDE

2. **Update these 3 lines** at the top:

```cpp
const char* ssid = "YourWiFiName";              // Your WiFi name
const char* password = "YourWiFiPassword";      // Your WiFi password
const char* serverUrl = "http://192.168.1.100:8000/sensor-data";  // Your IP from Step 1
```

**Example:**
```cpp
const char* ssid = "Home_WiFi_2024";
const char* password = "mypassword123";
const char* serverUrl = "http://192.168.1.105:8000/sensor-data";
```

3. **Upload to ESP32:**
   - Connect ESP32 via USB
   - Click **Upload** button (→) in Arduino IDE
   - Wait for "Done uploading"

---

### Step 3: Test It!

1. **Make sure your backend is running:**
   ```bash
   # In SilkSphere folder:
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Open Serial Monitor** in Arduino IDE:
   - Click: `Tools` → `Serial Monitor`
   - Set baud rate to: `115200`

3. **You should see:**
   ```
   ========================================
     SilkSphere IoT Sensor Node
   ========================================
   [✓] DHT11 sensor initialized
   [✓] Buzzer initialized
   
   [*] Connecting to WiFi: Home_WiFi_2024
   ....
   [✓] WiFi connected!
   [*] IP Address: 192.168.1.108
   
   ========================================
   Starting sensor readings...
   
   ┌─────────────────────────────┐
   │ Temperature: 25.3°C
   │ Humidity:    78.5%
   └─────────────────────────────┘
   [*] Sending: {"temperature":25.3,"humidity":78.5,"co2":900,"node_id":"ESP32-DHT11","timestamp":5}
   [✓] Backend responded: 200
   ```

4. **Check your SilkSphere dashboard** at http://localhost:5173
   - You should see REAL sensor data updating!

---

## 📊 What Happens Now?

Your ESP32 will:
- ✅ Read DHT11 temperature & humidity every 5 seconds
- ✅ Send data to your backend API
- ✅ Trigger buzzer if temperature > 32°C (your original alert)
- ✅ Backend stores data in `sensor_log.txt`
- ✅ Frontend displays real-time readings

---

## 🔧 Troubleshooting

### ESP32 Won't Connect to WiFi

**Problem:** Shows `[✗] WiFi connection failed!`

**Solutions:**
- ✅ Check WiFi name and password are correct (case-sensitive!)
- ✅ Make sure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- ✅ Move ESP32 closer to router
- ✅ Try restarting ESP32 (unplug and replug USB)

---

### Backend Not Receiving Data

**Problem:** Serial Monitor shows error after "Sending"

**Solutions:**

1. **Check backend is running:**
   - Open http://localhost:8000 in browser
   - Should see: `{"status":"Secure API is running"}`

2. **Check IP address is correct:**
   - Run `ipconfig` again
   - Make sure IP in Arduino code matches

3. **Check firewall:**
   ```bash
   # Windows: Allow port 8000
   # Or temporarily disable firewall to test
   ```

4. **ESP32 and computer must be on SAME WiFi network**

---

### Sensor Readings Are Wrong

**Problem:** Temperature always shows 0°C or NaN

**Solutions:**
- ✅ Check DHT11 wiring:
  - VCC → 3.3V
  - GND → GND
  - DATA → GPIO 23
- ✅ DHT11 might be faulty - try unplugging and reconnecting
- ✅ Add 10kΩ pull-up resistor between DATA and VCC (optional but recommended)

---

### Still Showing Mock Data on Dashboard

The frontend currently uses mock data. To use REAL sensor data:

**Option 1: Quick Test** - Open this URL in browser:
```
http://localhost:8000/sensor-data/latest
```
You should see your real sensor readings!

**Option 2: Update Frontend** (I can help you do this):
- Modify `src/context/AppContext.jsx`
- Change from mock data to API polling
- Frontend will then display real ESP32 data

---

## 📝 Example Serial Monitor Output

**Good Connection:**
```
[✓] WiFi connected!
┌─────────────────────────────┐
│ Temperature: 25.3°C
│ Humidity:    78.5%
└─────────────────────────────┘
[*] Sending: {"temperature":25.3,...}
[✓] Backend responded: 200
```

**No WiFi (still works locally):**
```
[✗] WiFi connection failed!
┌─────────────────────────────┐
│ Temperature: 25.3°C
│ Humidity:    78.5%
└─────────────────────────────┘
[*] Offline - data not sent to backend
```

---

## 🎯 Next Steps

Once this is working:

1. ✅ **Test for a few minutes** - Make sure data flows continuously
2. ✅ **Test temperature alert** - Use a lighter to warm DHT11 above 32°C (carefully!)
3. ✅ **Add MH-Z19B CO2 sensor** later for real CO2 readings (optional)
4. ✅ **Update frontend** to show real data instead of mock data

---

## 📞 Commands Summary

```bash
# Find your IP address:
ipconfig

# Start backend:
cd c:\Users\Asus\Desktop\SilkSphere2.0\SilkSphere\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test backend manually:
curl http://localhost:8000/sensor-data/latest

# Or open in browser:
http://localhost:8000
http://localhost:8000/sensor-data/latest
```

---

## ✅ Checklist

Before asking for help, check:

- [ ] WiFi credentials are correct in Arduino code
- [ ] IP address is correct (run `ipconfig`)
- [ ] Backend is running (http://localhost:8000 works)
- [ ] ESP32 and computer on same WiFi network
- [ ] Serial Monitor baud rate is 115200
- [ ] DHT11 wiring is correct (GPIO 23)
- [ ] USB cable is connected to ESP32

---

**Need help?** Check Serial Monitor output and tell me what you see!
