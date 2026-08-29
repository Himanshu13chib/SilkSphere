// ============================================================
// SilkSphere ESP32 Firmware
// DHT11 + OLED (SSD1306) + L293D Motor + Dashboard Control
// ============================================================
// WIRING:
//   DHT11  : VCC→3.3V | DATA→GPIO23 | GND→GND
//   OLED   : VCC→3.3V | GND→GND | SDA→GPIO21 | SCL→GPIO22
//   L293D  : EN1→GPIO27 | IN1→GPIO26 | IN2→GPIO25
//            Motor+→Output1 | Motor-→Output2
//            Pin8(MotorVCC)→5V | Pin16(LogicVCC)→3.3V
// ============================================================
// REQUIRED LIBRARIES (install via Arduino IDE Library Manager):
//   - DHT sensor library by Adafruit
//   - Adafruit SSD1306
//   - Adafruit GFX Library
//   - ArduinoJson (version 6.x)
// ============================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// ============================================================
// CONFIG
// ============================================================
const char* WIFI_SSID     = "NITTTR-Participance";
const char* WIFI_PASSWORD = "Network@2025";
const char* BACKEND_IP    = "192.168.93.140";
const int   BACKEND_PORT  = 5000;

// ============================================================
// PIN DEFINITIONS
// ============================================================
#define DHTPIN      23
#define DHTTYPE     DHT11

#define MOTOR_EN    27   // L293D Enable (PWM capable)
#define MOTOR_IN1   26   // L293D Input 1
#define MOTOR_IN2   25   // L293D Input 2

// ============================================================
// OLED CONFIG
// ============================================================
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT  64
#define OLED_RESET     -1   // No reset pin
#define OLED_ADDRESS  0x3C  // Try 0x3D if display stays blank

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
DHT dht(DHTPIN, DHTTYPE);

// ============================================================
// STATE
// ============================================================
float  temperature   = 0.0;
float  humidity      = 0.0;
int    co2           = 900;
bool   motorRunning  = false;
bool   manualOverride = false;
bool   dhtOk         = false;

unsigned long lastSendTime       = 0;
unsigned long lastMotorCheckTime = 0;
unsigned long lastOledUpdate     = 0;
int           loopCount          = 0;
int           sentCount          = 0;

const unsigned long SEND_INTERVAL        = 5000;   // Send sensor data every 5s
const unsigned long MOTOR_CHECK_INTERVAL = 2000;   // Poll dashboard commands every 2s
const unsigned long OLED_INTERVAL        = 1000;   // Refresh display every 1s

// ============================================================
// HELPERS
// ============================================================
String backendUrl(const char* path) {
  return String("http://") + BACKEND_IP + ":" + BACKEND_PORT + path;
}

void motorOn() {
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);
  digitalWrite(MOTOR_EN, HIGH);
  motorRunning = true;
}

void motorOff() {
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, LOW);
  digitalWrite(MOTOR_EN, LOW);
  motorRunning = false;
}

// ============================================================
// OLED DISPLAY
// ============================================================
void updateDisplay(const char* statusMsg = nullptr) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("SilkSphere v1.0");
  display.drawLine(0, 9, 127, 9, SSD1306_WHITE);

  if (!dhtOk) {
    display.setCursor(0, 16);
    display.setTextSize(1);
    display.println("DHT11 Error!");
    display.println("Check wiring:");
    display.println("DATA -> GPIO23");
    display.println("VCC  -> 3.3V");
  } else {
    // Temperature row
    display.setCursor(0, 13);
    display.setTextSize(1);
    display.print("Temp: ");
    display.setTextSize(2);
    display.print(temperature, 1);
    display.setTextSize(1);
    display.print(" C");

    // Humidity row
    display.setCursor(0, 34);
    display.print("Hum:  ");
    display.setTextSize(2);
    display.print(humidity, 0);
    display.setTextSize(1);
    display.print(" %");
  }

  // Bottom status bar
  display.drawLine(0, 54, 127, 54, SSD1306_WHITE);
  display.setCursor(0, 57);
  if (statusMsg) {
    display.print(statusMsg);
  } else {
    display.print("Fan:");
    display.print(motorRunning ? "ON " : "OFF");
    display.print(manualOverride ? " [M]" : " [A]");
    display.print(" #");
    display.print(loopCount);
  }

  display.display();
}

void showBootScreen() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(8, 10);
  display.println("SilkSphere");
  display.setTextSize(1);
  display.setCursor(20, 32);
  display.println("ESP32 Node v1.0");
  display.setCursor(28, 46);
  display.println("Connecting...");
  display.display();
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n=============================");
  Serial.println("  SilkSphere ESP32 Starting");
  Serial.println("=============================");

  // Motor pins
  pinMode(MOTOR_EN,  OUTPUT);
  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
  motorOff();

  // DHT11
  dht.begin();

  // OLED — try I2C address 0x3C first
  Wire.begin(21, 22);  // SDA=21, SCL=22
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println("OLED 0x3C failed, trying 0x3D...");
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
      Serial.println("OLED not found! Check wiring.");
      // Continue without OLED — don't halt
    } else {
      Serial.println("OLED found at 0x3D");
    }
  } else {
    Serial.println("OLED found at 0x3C");
  }
  display.clearDisplay();
  display.display();
  showBootScreen();

  // WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 10);
    display.println("WiFi Connected!");
    display.setCursor(0, 25);
    display.print("IP: ");
    display.println(WiFi.localIP());
    display.display();
    delay(2000);
  } else {
    Serial.println("\nWiFi FAILED — running offline");
    display.clearDisplay();
    display.setCursor(0, 10);
    display.println("WiFi Failed!");
    display.println("Offline mode.");
    display.display();
    delay(2000);
  }

  Serial.println("Setup complete.\n");
}

// ============================================================
// READ DHT11
// ============================================================
void readDHT() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    dhtOk = false;
    Serial.println("[DHT11] Read failed — check GPIO23 wiring");
  } else {
    dhtOk = true;
    temperature = t;
    humidity    = h;
    co2 = random(850, 1001);  // Simulated CO2 (no sensor)
    Serial.printf("[DHT11] Temp=%.1f°C  Hum=%.1f%%  CO2=%d ppm\n", temperature, humidity, co2);
  }
}

// ============================================================
// SEND DATA TO BACKEND
// ============================================================
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Not connected — skip send");
    return;
  }

  if (!dhtOk) {
    Serial.println("[Send] Skipped — DHT11 not ready");
    return;
  }

  HTTPClient http;
  String url = backendUrl("/sensor-data");
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4000);

  String json = "{\"temperature\":" + String(temperature, 1)
              + ",\"humidity\":"    + String(humidity, 1)
              + ",\"co2\":"         + String(co2)
              + ",\"node_id\":\"ESP32-DHT11\"}";

  Serial.println("[Send] " + json);
  int code = http.POST(json);

  if (code > 0) {
    sentCount++;
    Serial.printf("[Send] ✓ HTTP %d  (sent %d)\n", code, sentCount);
  } else {
    Serial.printf("[Send] ✗ Error %d (%s)\n", code, http.errorToString(code).c_str());
  }

  http.end();
}

// ============================================================
// POLL DASHBOARD MOTOR COMMANDS
// ============================================================
void checkDashboardCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = backendUrl("/motor-control");
  http.begin(url);
  http.setTimeout(3000);

  int code = http.GET();
  if (code == 200) {
    String body = http.getString();

    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, body);

    if (!err) {
      bool newManual   = doc["manual_override"] | false;
      bool newMotorCmd = doc["motor_enabled"]   | false;

      manualOverride = newManual;

      if (manualOverride) {
        // Dashboard has control
        if (newMotorCmd && !motorRunning)  { motorOn();  Serial.println("[Motor] Dashboard → ON");  }
        if (!newMotorCmd && motorRunning)  { motorOff(); Serial.println("[Motor] Dashboard → OFF"); }
      } else {
        // Auto mode: fan on if temp > 30°C
        bool autoOn = (temperature > 30.0);
        if (autoOn && !motorRunning)  { motorOn();  Serial.println("[Motor] Auto → ON  (Temp>30)"); }
        if (!autoOn && motorRunning)  { motorOff(); Serial.println("[Motor] Auto → OFF"); }
      }
    }
  } else if (code < 0) {
    Serial.printf("[Motor] Poll failed: %d\n", code);
  }

  http.end();
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  unsigned long now = millis();
  loopCount++;

  // 1. Read sensor
  readDHT();

  // 2. Update OLED every second
  if (now - lastOledUpdate >= OLED_INTERVAL) {
    lastOledUpdate = now;
    updateDisplay();
  }

  // 3. Send data every 5 seconds
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;
    sendSensorData();
  }

  // 4. Poll dashboard motor commands every 2 seconds
  if (now - lastMotorCheckTime >= MOTOR_CHECK_INTERVAL) {
    lastMotorCheckTime = now;
    checkDashboardCommands();
  }

  // 5. Serial status line
  Serial.printf("[Loop %d] Temp:%.1f°C  Hum:%.1f%%  Motor:%s  Mode:%s  WiFi:%s\n",
    loopCount,
    temperature,
    humidity,
    motorRunning ? "ON" : "OFF",
    manualOverride ? "MANUAL" : "AUTO",
    WiFi.status() == WL_CONNECTED ? "OK" : "LOST"
  );

  delay(1000);
}
