# SilkSphere ESP32 Hardware Wiring Guide

## ✅ Complete Component List

- **ESP32 DevKit** (30 or 38 pin version)
- **DHT11 Temperature & Humidity Sensor**
- **OLED Display** (128x64, I2C, SSD1306 driver)
- **L293D Motor Driver IC** (16-pin DIP)
- **DC Motor** (5-12V)
- **Breadboard & Jumper Wires**
- **Power Supply** (5V recommended)

---

## 📌 Pin Connections

### DHT11 Sensor Wiring

```
DHT11 Pin     →    ESP32 Pin
─────────────────────────────
VCC (+)       →    3.3V
DATA (Signal) →    GPIO 23
GND (-)       →    GND
```

> **⚠️ CRITICAL**: DHT11 must use GPIO **23** exactly as coded

---

### OLED Display Wiring (I2C)

```
OLED Pin      →    ESP32 Pin
─────────────────────────────
VCC           →    3.3V
GND           →    GND
SDA (Data)    →    GPIO 21
SCL (Clock)   →    GPIO 22
```

> **Note**: If display shows nothing, try I2C address `0x3D` instead of `0x3C` (change in code line 117)

---

### L293D Motor Driver Wiring

```
L293D Pin     →    Connect To
─────────────────────────────────────────────────
Pin 1  (EN1)  →    ESP32 GPIO 27
Pin 2  (IN1)  →    ESP32 GPIO 26
Pin 3  (OUT1) →    DC Motor (+) Red wire
Pin 4  (GND)  →    GND (common ground)
Pin 5  (GND)  →    GND (common ground)
Pin 6  (OUT2) →    DC Motor (-) Black wire
Pin 7  (IN2)  →    ESP32 GPIO 25
Pin 8  (VCC2) →    5V (motor power supply)
Pin 9-15      →    (Not used for single motor)
Pin 16 (VCC1) →    3.3V (logic power from ESP32)
```

> **⚠️ IMPORTANT MOTOR CONNECTIONS**:
> - Pin 8 (VCC2) = **MOTOR power supply** → Connect to external 5V (NOT ESP32)
> - Pin 16 (VCC1) = **LOGIC power** → Connect to ESP32 3.3V
> - Motor wires go to Pin 3 (OUT1) and Pin 6 (OUT2)
> - **All grounds must be common** (ESP32 GND + Motor GND + L293D GND)

---

## 🔌 Complete Power Distribution

```
Power Source            →    Component
───────────────────────────────────────────
ESP32 3.3V Pin          →    DHT11 VCC
                        →    OLED VCC
                        →    L293D Pin 16 (logic)

External 5V Supply      →    L293D Pin 8 (motor power)
                        →    DC Motor (via L293D)

Common GND              →    ESP32 GND
(ALL must connect!)     →    DHT11 GND
                        →    OLED GND
                        →    L293D Pin 4, 5
                        →    External 5V GND
```

---

## 📊 Visual Wiring Diagram (ASCII)

```
                   ┌──────────────────┐
                   │   ESP32 DevKit   │
                   ├──────────────────┤
         GPIO 23 ──┤                  │
  DHT11  GPIO 21 ──┤ (SDA)            │
  OLED   GPIO 22 ──┤ (SCL)            │
         GPIO 27 ──┤                  │──── L293D Enable
  MOTOR  GPIO 26 ──┤                  │──── L293D IN1
  CTRL   GPIO 25 ──┤                  │──── L293D IN2
                   │                  │
         3.3V    ──┤                  │──┐
         GND     ──┤                  │  │
                   └──────────────────┘  │
                                         │
         ┌───────────────────────────────┘
         │
         ├──→ DHT11 VCC
         ├──→ OLED VCC
         ├──→ L293D Pin 16
         │
         └──→ All GND pins

    ┌────────────────────────┐
    │  L293D Motor Driver    │
    │  (16-pin DIP chip)     │
    ├────────────────────────┤
    │ Pin 1  EN1 ← GPIO 27   │
    │ Pin 2  IN1 ← GPIO 26   │
    │ Pin 3  OUT1→ Motor+    │
    │ Pin 4  GND ← GND       │
    │ Pin 5  GND ← GND       │
    │ Pin 6  OUT2→ Motor-    │
    │ Pin 7  IN2 ← GPIO 25   │
    │ Pin 8  VCC2← 5V Ext    │
    │         ...            │
    │ Pin 16 VCC1← 3.3V      │
    └────────────────────────┘
```

---

## 🛠️ Arduino IDE Library Requirements

**Before uploading, install these libraries:**

1. Open Arduino IDE
2. Go to: **Sketch → Include Library → Manage Libraries**
3. Search and install:
   - ✅ **DHT sensor library** by Adafruit
   - ✅ **Adafruit Unified Sensor** (dependency)
   - ✅ **Adafruit SSD1306** (OLED display)
   - ✅ **Adafruit GFX Library** (graphics)
   - ✅ **ArduinoJson** by Benoit Blanchon (⚠️ Install **version 6.x**, not 7.x)

---

## 🚀 Upload Instructions

1. **Connect ESP32** to PC via USB cable
2. **Select Board**: Tools → Board → ESP32 Dev Module
3. **Select Port**: Tools → Port → (your COM port)
4. **Open File**: `esp32_READY_TO_UPLOAD.ino`
5. **Click Upload** button (→)
6. **Wait** for "Done uploading" message
7. **Open Serial Monitor** (Tools → Serial Monitor, set to 115200 baud)

---

## 🔍 Troubleshooting

### DHT11 Not Reading (shows "DHT11 Error!" on OLED)

- ✅ Check DATA wire is on **GPIO 23** exactly
- ✅ Verify VCC is 3.3V (NOT 5V)
- ✅ Try adding a 10kΩ pull-up resistor between DATA and VCC
- ✅ Some DHT11 modules have 3 pins, some have 4 (4th pin = no connect)

### OLED Display Blank

- ✅ Check SDA → GPIO 21, SCL → GPIO 22
- ✅ Verify power: 3.3V to VCC, GND to GND
- ✅ Try changing I2C address in code line 117:
  ```cpp
  // Change from:
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
  // To:
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
  ```

### Motor Not Spinning

- ✅ Verify **Pin 8 (VCC2)** of L293D has 5V external power
- ✅ Check all ground connections are common
- ✅ Confirm GPIO 27, 26, 25 are connected correctly
- ✅ Test motor directly with 5V to verify it works
- ✅ Check "Manual Override" is enabled in dashboard UI

### WiFi Not Connecting

- ✅ Verify SSID: `NITTTR-Participance`
- ✅ Verify password: `Network@2025`
- ✅ Check laptop IP matches backend code: `192.168.93.140`
- ✅ Ensure both ESP32 and laptop are on same network

### Backend Shows "Connection Failed"

- ✅ Run backend: `cd backend` → `python main.py`
- ✅ Check backend port 5000 is not blocked by firewall
- ✅ Verify laptop IP hasn't changed (run `ipconfig` on Windows)
- ✅ Test URL in browser: `http://192.168.93.140:5000/`

---

## 📈 Expected Serial Monitor Output (Success)

```
=============================
  SilkSphere ESP32 Starting
=============================
OLED found at 0x3C
Connecting to WiFi: NITTTR-Participance
..........
WiFi Connected!
IP: 192.168.93.xxx
Setup complete.

[DHT11] Temp=27.6°C  Hum=51.0%  CO2=925 ppm
[Loop 1] Temp:27.6°C  Hum:51.0%  Motor:OFF  Mode:AUTO  WiFi:OK
[Send] {"temperature":27.6,"humidity":51.0,"co2":925,"node_id":"ESP32-DHT11"}
[Send] ✓ HTTP 200  (sent 1)
[Motor] Auto → OFF
[Loop 2] Temp:27.6°C  Hum:51.0%  Motor:OFF  Mode:AUTO  WiFi:OK
```

---

## ✅ Final Checklist

Before powering on:

- [ ] DHT11 DATA → GPIO 23
- [ ] OLED SDA → GPIO 21, SCL → GPIO 22
- [ ] L293D EN1 → GPIO 27
- [ ] L293D IN1 → GPIO 26
- [ ] L293D IN2 → GPIO 25
- [ ] L293D Pin 8 → External 5V (motor power)
- [ ] L293D Pin 16 → 3.3V (logic power)
- [ ] All GND pins connected together (common ground)
- [ ] Arduino libraries installed (DHT, SSD1306, ArduinoJson 6.x)
- [ ] Backend running on `http://192.168.93.140:5000`
- [ ] Frontend running on `http://localhost:5173`

---

## 🎯 What Each Component Does

| Component | Purpose |
|-----------|---------|
| **DHT11** | Measures temperature (20-50°C) and humidity (20-90%) |
| **OLED** | Displays sensor readings and motor status locally |
| **L293D** | Controls DC motor direction and speed |
| **ESP32** | Reads sensors, sends data to backend, receives motor commands |
| **Backend** | Stores data, provides API for frontend |
| **Frontend** | Dashboard UI for monitoring and manual motor control |

---

## 📞 Support

If you continue to have issues:

1. **Check Serial Monitor output** — it will tell you exactly what's failing
2. **Verify wiring** using a multimeter if possible
3. **Test components individually** before full integration
4. **Ensure all libraries are correct versions** (especially ArduinoJson 6.x)

**The code is now complete and production-ready!** 🎉
