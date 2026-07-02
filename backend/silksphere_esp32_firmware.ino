// ====================================================================
// SilkSphere IoT Sensor Node - ESP32 Firmware
// Based on your existing setup with proper thresholds
// ====================================================================
// Hardware: ESP32 + DHT11/DHT22 (GPIO 23) + Buzzer (GPIO 25)
// Sends sensor readings to SilkSphere backend via HTTP POST
// ====================================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include <ArduinoJson.h>

// ============ WIFI CONFIGURATION ============
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password

// ============ BACKEND CONFIGURATION ============
// Replace with your computer's local IP address (find using: ipconfig on Windows)
// Example: "http://192.168.1.100:8000/sensor-data"
const char* serverUrl = "http://YOUR_COMPUTER_IP:8000/sensor-data";

// ============ PIN CONFIGURATION ============
#define DHTPIN 23        // DHT sensor data pin (GPIO 23)
#define DHTTYPE DHT11    // Change to DHT22 if you have DHT22 (more accurate)
#define BUZZER_PIN 25    // Buzzer pin (GPIO 25)

// Note: If you add MH-Z19B CO2 sensor later, connect to:
// - TX to GPIO 16, RX to GPIO 17 (Serial2)

// ============ SENSOR UPDATE INTERVAL ============
#define UPDATE_INTERVAL 5000  // Send data every 5 seconds (5000ms)

// ============ SILKWORM LIFECYCLE THRESHOLDS ============
// Based on SilkSphere Environmental Threshold Table

struct Thresholds {
  float temp_ideal_min;
  float temp_ideal_max;
  float temp_alert_min;
  float temp_alert_max;
  float humidity_ideal_min;
  float humidity_ideal_max;
  float humidity_alert_min;
  float humidity_alert_max;
  int co2_ideal_max;
  int co2_alert_max;
};

// Instar I-III (Young Larvae)
Thresholds instar_young = {26.0, 28.0, 24.0, 30.0, 80.0, 85.0, 70.0, 90.0, 400, 1500};

// Instar IV-V (Late Larvae)
Thresholds instar_late = {22.0, 26.0, 20.0, 28.0, 70.0, 80.0, 55.0, 90.0, 400, 1500};

// Cocoon / Pupal Stage
Thresholds cocoon = {23.0, 25.0, 20.0, 28.0, 65.0, 75.0, 60.0, 85.0, 400, 1500};

// Current stage (change this based on your current lifecycle stage)
Thresholds* currentStage = &instar_young;  // Default to young larvae
String currentStageName = "Instar I-III";

// ============ SENSOR & NETWORKING ============
DHT dht(DHTPIN, DHTTYPE);
HTTPClient http;
unsigned long lastUpdate = 0;
unsigned long lastBuzzerBeep = 0;
bool wifiConnected = false;

// ============ SETUP ============
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n===========================================");
  Serial.println("   SilkSphere IoT Sensor Node v2.0");
  Serial.println("   Environmental Monitoring System");
  Serial.println("===========================================");
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("[✓] DHT11/22 sensor initialized");
  
  // Initialize buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("[✓] Buzzer initialized on GPIO 25");
  
  // Startup beep sequence
  beepStartup();
  
  // Print current lifecycle stage
  Serial.print("[*] Current Stage: ");
  Serial.println(currentStageName);
  printCurrentThresholds();
  
  // Connect to WiFi
  Serial.print("\n[*] Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n[✓] WiFi connected!");
    Serial.print("[*] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[*] Backend URL: ");
    Serial.println(serverUrl);
    beepSuccess();
  } else {
    wifiConnected = false;
    Serial.println("\n[✗] WiFi connection failed!");
    Serial.println("[*] Will continue with offline logging only");
    beepError();
  }
  
  Serial.println("\n===========================================");
  Serial.println("Starting sensor readings...\n");
}

// ============ MAIN LOOP ============
void loop() {
  unsigned long currentMillis = millis();
  
  // Check if it's time to read and send data
  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = currentMillis;
    
    // Read sensor data
    float temperature = dht.readTemperature();  // Celsius
    float humidity = dht.readHumidity();        // Percentage
    
    // Check if readings are valid
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("[✗] Failed to read from DHT sensor! Check wiring.");
      beepError();
      return;
    }
    
    // For now, use a placeholder CO2 value (add MH-Z19B sensor later for real values)
    int co2 = 400;  // Default ideal CO2 level
    
    // Print to Serial Monitor
    printSensorData(temperature, humidity, co2);
    
    // Check thresholds and trigger alerts
    checkThresholds(temperature, humidity, co2);
    
    // Send data to backend if WiFi is connected
    if (wifiConnected && WiFi.status() == WL_CONNECTED) {
      sendDataToBackend(temperature, humidity, co2);
    } else {
      Serial.println("[*] Offline mode - data logged locally only");
    }
  }
}

// ============ PRINT SENSOR DATA ============
void printSensorData(float temp, float humidity, int co2) {
  Serial.println("┌──────────────────────────────────────┐");
  Serial.println("│      SENSOR READINGS                 │");
  Serial.println("├──────────────────────────────────────┤");
  Serial.printf("│ Temperature:  %.1f°C                \n", temp);
  Serial.printf("│ Humidity:     %.1f%%                \n", humidity);
  Serial.printf("│ CO2:          %d ppm                 \n", co2);
  Serial.printf("│ Stage:        %s              \n", currentStageName.c_str());
  Serial.println("└──────────────────────────────────────┘");
}

// ============ CHECK THRESHOLDS ============
void checkThresholds(float temp, float humidity, int co2) {
  bool alertTriggered = false;
  String alertMessage = "";
  
  // Temperature checks
  if (temp < currentStage->temp_alert_min) {
    alertMessage += "[⚠ ALERT] Temperature TOO LOW: " + String(temp, 1) + "°C (Min: " + String(currentStage->temp_alert_min, 1) + "°C)\n";
    alertTriggered = true;
  } else if (temp > currentStage->temp_alert_max) {
    alertMessage += "[⚠ ALERT] Temperature TOO HIGH: " + String(temp, 1) + "°C (Max: " + String(currentStage->temp_alert_max, 1) + "°C)\n";
    alertTriggered = true;
  } else if (temp < currentStage->temp_ideal_min || temp > currentStage->temp_ideal_max) {
    alertMessage += "[⚡ WARNING] Temperature outside ideal range: " + String(temp, 1) + "°C (Ideal: " + 
                    String(currentStage->temp_ideal_min, 1) + "-" + String(currentStage->temp_ideal_max, 1) + "°C)\n";
  }
  
  // Humidity checks
  if (humidity < currentStage->humidity_alert_min) {
    alertMessage += "[⚠ ALERT] Humidity TOO LOW: " + String(humidity, 1) + "% (Min: " + String(currentStage->humidity_alert_min, 1) + "%)\n";
    alertTriggered = true;
  } else if (humidity > currentStage->humidity_alert_max) {
    alertMessage += "[⚠ ALERT] Humidity TOO HIGH: " + String(humidity, 1) + "% (Max: " + String(currentStage->humidity_alert_max, 1) + "%)\n";
    alertTriggered = true;
  } else if (humidity < currentStage->humidity_ideal_min || humidity > currentStage->humidity_ideal_max) {
    alertMessage += "[⚡ WARNING] Humidity outside ideal range: " + String(humidity, 1) + "% (Ideal: " + 
                    String(currentStage->humidity_ideal_min, 1) + "-" + String(currentStage->humidity_ideal_max, 1) + "%)\n";
  }
  
  // CO2 checks (when you add MH-Z19B sensor)
  if (co2 > 20000) {
    alertMessage += "[🚨 CRITICAL] CO2 DANGER LEVEL: " + String(co2) + " ppm (>20,000 ppm causes severe growth retardation!)\n";
    alertTriggered = true;
    beepCritical();
  } else if (co2 > currentStage->co2_alert_max) {
    alertMessage += "[⚠ ALERT] CO2 TOO HIGH: " + String(co2) + " ppm (Max: " + String(currentStage->co2_alert_max) + " ppm)\n";
    alertTriggered = true;
  }
  
  // Print alerts if any
  if (alertMessage.length() > 0) {
    Serial.println("\n╔════════════════════════════════════════╗");
    Serial.println("║          THRESHOLD ALERTS              ║");
    Serial.println("╠════════════════════════════════════════╣");
    Serial.print(alertMessage);
    Serial.println("╚════════════════════════════════════════╝\n");
  } else {
    Serial.println("[✓] All parameters within IDEAL range\n");
  }
  
  // Trigger buzzer for alerts (rate-limited to avoid continuous beeping)
  if (alertTriggered && (millis() - lastBuzzerBeep > 10000)) {  // Max once per 10 seconds
    beepAlert();
    lastBuzzerBeep = millis();
  }
}

// ============ SEND DATA TO BACKEND ============
void sendDataToBackend(float temp, float humidity, int co2) {
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["temperature"] = round(temp * 10) / 10.0;
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["co2"] = co2;
  doc["timestamp"] = millis() / 1000;
  doc["node_id"] = "ESP32-SilkSphere";
  doc["lifecycle_stage"] = currentStageName;
  
  // Add threshold status
  bool temp_ok = (temp >= currentStage->temp_ideal_min && temp <= currentStage->temp_ideal_max);
  bool humidity_ok = (humidity >= currentStage->humidity_ideal_min && humidity <= currentStage->humidity_ideal_max);
  bool co2_ok = (co2 <= currentStage->co2_ideal_max);
  
  doc["status"]["temperature"] = temp_ok ? "OK" : "ALERT";
  doc["status"]["humidity"] = humidity_ok ? "OK" : "ALERT";
  doc["status"]["co2"] = co2_ok ? "OK" : "ALERT";
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  Serial.println("[*] Sending data to backend...");
  
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("[✓] Backend response: %d\n", httpResponseCode);
  } else {
    Serial.printf("[✗] Backend error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}

// ============ BUZZER FUNCTIONS ============
void beepStartup() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);
  delay(50);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);
}

void beepSuccess() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(50);
    digitalWrite(BUZZER_PIN, LOW);
    delay(50);
  }
}

void beepError() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(500);
  digitalWrite(BUZZER_PIN, LOW);
}

void beepAlert() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

void beepCritical() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

// ============ UTILITY FUNCTIONS ============
void printCurrentThresholds() {
  Serial.println("\n--- Current Stage Thresholds ---");
  Serial.printf("Temperature: %.1f-%.1f°C (Alert: <%.1f or >%.1f°C)\n", 
                currentStage->temp_ideal_min, currentStage->temp_ideal_max,
                currentStage->temp_alert_min, currentStage->temp_alert_max);
  Serial.printf("Humidity: %.1f-%.1f%% (Alert: <%.1f%% or >%.1f%%)\n",
                currentStage->humidity_ideal_min, currentStage->humidity_ideal_max,
                currentStage->humidity_alert_min, currentStage->humidity_alert_max);
  Serial.printf("CO2: <=%d ppm (Alert: >%d ppm)\n",
                currentStage->co2_ideal_max, currentStage->co2_alert_max);
  Serial.println("--------------------------------\n");
}

// ============ LIFECYCLE STAGE CHANGE (Call this function when stage changes) ============
void changeLifecycleStage(String stageName) {
  if (stageName == "Instar I-III" || stageName == "young") {
    currentStage = &instar_young;
    currentStageName = "Instar I-III";
  } else if (stageName == "Instar IV-V" || stageName == "late") {
    currentStage = &instar_late;
    currentStageName = "Instar IV-V";
  } else if (stageName == "Cocoon" || stageName == "cocoon") {
    currentStage = &cocoon;
    currentStageName = "Cocoon/Pupal";
  }
  
  Serial.println("\n[*] Lifecycle stage changed to: " + currentStageName);
  printCurrentThresholds();
  beepSuccess();
}

// ============ OPTIONAL: Serial Commands ============
// You can send commands via Serial Monitor to change settings
// Example: Type "stage:late" to switch to Instar IV-V stage
void checkSerialCommands() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command.startsWith("stage:")) {
      String stage = command.substring(6);
      changeLifecycleStage(stage);
    }
  }
}
