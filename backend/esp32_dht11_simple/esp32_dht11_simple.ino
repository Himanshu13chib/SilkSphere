#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

//=========================
// WiFi & Backend
//=========================
const char* ssid      = "Himanshu";
const char* password  = "9102149@Hh";
const char* serverUrl = "http://10.46.221.226:5000/sensor-data";
const char* motorUrl  = "http://10.46.221.226:5000/motor-control";

//=========================
// Pins
//=========================
#define DHTPIN      23
#define DHTTYPE     DHT11
#define RELAY_PIN   4
#define BUZZER_PIN  14

//=========================
// OLED
//=========================
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1

//=========================
// Thresholds
//=========================
const float TEMP_MOTOR_ON  = 28.0;
const float TEMP_MOTOR_OFF = 26.0;
const float TEMP_ALERT     = 30.0;
const int   CO2_ALERT      = 1000;  // Simulated CO2 alert threshold

//=========================
// Objects
//=========================
DHT dht(DHTPIN, DHTTYPE);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

//=========================
// State
//=========================
float lastTemp       = 0.0;
float lastHumi       = 0.0;
int   lastCO2        = 850;   // Simulated CO2
bool  motorRunning   = false;
bool  manualOverride = false;
bool  oledOK         = false;
bool  wasHighTemp    = false;
int   loopCount      = 0;
int   successCount   = 0;
int   failCount      = 0;
int   oledPage       = 0;     // 0=Temp/Humi, 1=CO2/Motor

unsigned long lastSendTime    = 0;
unsigned long lastControlTime = 0;
unsigned long lastReadTime    = 0;
unsigned long lastDisplayTime = 0;
unsigned long lastBeepTime    = 0;
unsigned long lastPageSwitch  = 0;

//=========================
// Motor
//=========================
void setMotor(bool state) {
  motorRunning = state;
  digitalWrite(RELAY_PIN, state ? LOW : HIGH);
  Serial.println(state ? ">>> Motor: ON" : ">>> Motor: OFF");
}

//=========================
// Simulated CO2 — realistic range for silkworm rearing
// Varies based on temperature (higher temp = more CO2)
//=========================
int simulateCO2(float temp) {
  // Base CO2: 850-1000 ppm, rises with temperature
  int base = 850;
  int tempBoost = (int)((temp - 24.0) * 15.0);  // +15 ppm per degree above 24
  int noise = random(-20, 20);
  int co2 = base + tempBoost + noise;
  co2 = constrain(co2, 800, 1200);
  return co2;
}

//=========================
// OLED — Page 1: Temp & Humidity
//=========================
void showPage1(float t, float h) {
  display.clearDisplay();

  // Header
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(18, 0);
  display.print("SilkSphere 1/2");
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  // Temperature (large)
  display.setCursor(0, 13);
  display.setTextSize(1);
  display.print("TEMP");
  display.setTextSize(2);
  display.setCursor(0, 22);
  display.print(t, 1);
  display.setTextSize(1);
  display.print(" C");

  // Alert marker
  if (t > TEMP_ALERT) {
    display.setCursor(90, 22);
    display.print("HIGH!");
  } else if (t > TEMP_MOTOR_ON) {
    display.setCursor(90, 22);
    display.print("WARM");
  } else {
    display.setCursor(90, 22);
    display.print("OK");
  }

  // Humidity (large)
  display.setCursor(0, 38);
  display.setTextSize(1);
  display.print("HUMI");
  display.setTextSize(2);
  display.setCursor(0, 47);
  display.print(h, 0);
  display.setTextSize(1);
  display.print(" %");

  // Humidity status
  if (h < 60) {
    display.setCursor(90, 47);
    display.print("DRY!");
  } else if (h > 85) {
    display.setCursor(90, 47);
    display.print("WET!");
  } else {
    display.setCursor(90, 47);
    display.print("OK");
  }

  display.display();
}

//=========================
// OLED — Page 2: CO2 & Motor Status
//=========================
void showPage2(int co2, float t) {
  display.clearDisplay();

  // Header
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(18, 0);
  display.print("SilkSphere 2/2");
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  // CO2
  display.setCursor(0, 13);
  display.print("CO2 (sim)");
  display.setTextSize(2);
  display.setCursor(0, 22);
  display.print(co2);
  display.setTextSize(1);
  display.print(" ppm");

  // CO2 status
  if (co2 > CO2_ALERT) {
    display.setCursor(90, 22);
    display.print("HIGH!");
  } else {
    display.setCursor(90, 22);
    display.print("OK");
  }

  // Motor status
  display.drawLine(0, 38, 128, 38, SSD1306_WHITE);
  display.setCursor(0, 42);
  display.print("Fan: ");
  display.setTextSize(2);
  display.print(motorRunning ? "ON " : "OFF");
  display.setTextSize(1);
  display.print(manualOverride ? "[M]" : "[A]");

  // Sent count
  display.setCursor(0, 57);
  display.print("Sent:");
  display.print(successCount);
  display.print(" Fail:");
  display.print(failCount);

  display.display();
}

//=========================
// Poll Dashboard
//=========================
void checkDashboard() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient hc;
  hc.begin(motorUrl);
  hc.setTimeout(2000);
  int code = hc.GET();
  if (code == 200) {
    String payload = hc.getString();
    StaticJsonDocument<200> doc;
    if (!deserializeJson(doc, payload)) {
      bool newManual  = doc["manual_override"] | false;
      bool newEnabled = doc["motor_enabled"]   | false;
      if (newManual != manualOverride) {
        manualOverride = newManual;
        Serial.println(manualOverride ? "Mode → MANUAL" : "Mode → AUTO");
      }
      if (manualOverride && newEnabled != motorRunning) {
        setMotor(newEnabled);
      }
    }
  }
  hc.end();
}

//=========================
// WiFi reconnect
//=========================
void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.println("WiFi lost — reconnecting...");
  WiFi.disconnect();
  WiFi.begin(ssid, password);
  int a = 0;
  while (WiFi.status() != WL_CONNECTED && a++ < 20) {
    delay(500); Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED)
    Serial.println("WiFi restored: " + WiFi.localIP().toString());
}

//=========================
// SETUP
//=========================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(RELAY_PIN,  OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(RELAY_PIN,  HIGH);
  digitalWrite(BUZZER_PIN, LOW);

  // OLED init
  Wire.begin(21, 22);
  delay(100);
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledOK = true;
    Serial.println("OLED OK at 0x3C");
  } else if (display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
    oledOK = true;
    Serial.println("OLED OK at 0x3D");
  } else {
    Serial.println("OLED not found — check wiring");
  }

  if (oledOK) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(15, 15); display.println("SilkSphere");
    display.setCursor(15, 30); display.println("Starting...");
    display.display();
  }

  dht.begin();
  delay(2000);

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Himanshu");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts++ < 40) {
    delay(500); Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    String ip = WiFi.localIP().toString();
    Serial.println("WiFi OK: " + ip);
    if (oledOK) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setTextColor(SSD1306_WHITE);
      display.setCursor(0,  5); display.println("WiFi Connected!");
      display.setCursor(0, 20); display.print("IP: "); display.println(ip);
      display.setCursor(0, 35); display.println("SilkSphere Ready!");
      display.display();
      delay(2000);
    }
  } else {
    Serial.println("WiFi FAILED");
  }

  Serial.println("\n=== Ready ===");
  Serial.println("Temp>28 = Motor ON | Temp<26 = Motor OFF | Temp>30 = Buzzer");
}

//=========================
// LOOP
//=========================
void loop() {
  unsigned long now = millis();
  loopCount++;

  // Read DHT11 every 2s
  if (now - lastReadTime >= 2000) {
    lastReadTime = now;
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    if (!isnan(h) && !isnan(t)) {
      lastTemp = t;
      lastHumi = h;
      lastCO2  = simulateCO2(t);  // Generate realistic CO2
    } else {
      Serial.println("[DHT11] Read failed");
    }
  }

  float t   = lastTemp;
  float h   = lastHumi;
  int   co2 = lastCO2;
  bool  isHighTemp = (t > TEMP_ALERT && t > 0);
  bool  isHighCO2  = (co2 > CO2_ALERT);

  // Buzzer — beep on high temp OR high CO2
  bool shouldBuzz = (isHighTemp || isHighCO2);
  if (shouldBuzz) {
    if (now - lastBeepTime >= 3000) {
      lastBeepTime = now;
      if (isHighTemp && isHighCO2) {
        // Double beep for both alerts
        digitalWrite(BUZZER_PIN, HIGH); delay(200);
        digitalWrite(BUZZER_PIN, LOW);  delay(100);
        digitalWrite(BUZZER_PIN, HIGH); delay(200);
        digitalWrite(BUZZER_PIN, LOW);  delay(100);
        digitalWrite(BUZZER_PIN, HIGH); delay(200);
        digitalWrite(BUZZER_PIN, LOW);
        Serial.println("[BUZZ] Temp>30 AND CO2>1000!");
      } else if (isHighTemp) {
        digitalWrite(BUZZER_PIN, HIGH); delay(300);
        digitalWrite(BUZZER_PIN, LOW);  delay(100);
        digitalWrite(BUZZER_PIN, HIGH); delay(300);
        digitalWrite(BUZZER_PIN, LOW);
        Serial.println("[BUZZ] Temp>30!");
      } else {
        digitalWrite(BUZZER_PIN, HIGH); delay(150);
        digitalWrite(BUZZER_PIN, LOW);  delay(150);
        digitalWrite(BUZZER_PIN, HIGH); delay(150);
        digitalWrite(BUZZER_PIN, LOW);
        Serial.println("[BUZZ] CO2>1000!");
      }
    }
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  if (isHighTemp && !wasHighTemp) Serial.println("*** HIGH TEMP ALERT ***");
  if (!isHighTemp && wasHighTemp) Serial.println("*** Temp normal ***");
  wasHighTemp = isHighTemp;

  // Auto motor — temp based
  if (!manualOverride) {
    if (t > TEMP_MOTOR_ON && !motorRunning) {
      setMotor(true);
      Serial.println("AUTO: Motor ON (Temp>" + String(TEMP_MOTOR_ON) + ")");
    } else if (t < TEMP_MOTOR_OFF && motorRunning) {
      setMotor(false);
      Serial.println("AUTO: Motor OFF (Temp<" + String(TEMP_MOTOR_OFF) + ")");
    }
  }

  // OLED — switch page every 4 seconds
  if (now - lastPageSwitch >= 4000) {
    lastPageSwitch = now;
    oledPage = 1 - oledPage;  // toggle 0↔1
  }

  if (now - lastDisplayTime >= 500) {
    lastDisplayTime = now;
    if (oledOK) {
      if (oledPage == 0) showPage1(t, h);
      else               showPage2(co2, t);
    }
  }

  // Dashboard poll every 3s
  if (now - lastControlTime >= 3000) {
    lastControlTime = now;
    checkDashboard();
  }

  // Send to backend every 5s
  if (now - lastSendTime >= 5000) {
    lastSendTime = now;
    ensureWiFi();
    if (WiFi.status() == WL_CONNECTED && t > 0) {
      String json = "{\"temperature\":" + String(t, 1)
                  + ",\"humidity\":"    + String(h, 1)
                  + ",\"co2\":"         + String(co2)
                  + ",\"motor_status\":\"" + (motorRunning ? "ON" : "OFF") + "\""
                  + ",\"node_id\":\"ESP32-DHT11\"}";
      HTTPClient hc;
      hc.begin(serverUrl);
      hc.addHeader("Content-Type", "application/json");
      hc.setTimeout(6000);
      int code = hc.POST(json);
      if (code == 200) {
        successCount++;
        Serial.println("Sent OK (" + String(successCount) + ")");
      } else {
        failCount++;
        Serial.println("Send failed: " + String(code));
      }
      hc.end();
    }
  }

  Serial.printf("Loop %d | T:%.1fC | H:%.1f%% | CO2:%d | Motor:%s | %s | OK:%d\n",
    loopCount, t, h, co2,
    motorRunning   ? "ON"     : "OFF",
    manualOverride ? "MANUAL" : "AUTO",
    successCount
  );

  delay(200);
}
