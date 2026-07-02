// ====================================================================
// SilkSphere - Simple WiFi Integration for Your Existing Setup
// Hardware: ESP32 + DHT11 (GPIO 23) + Buzzer (GPIO 25)
// ====================================================================
// This adds WiFi capability to your existing code!
// Just update WiFi credentials and backend URL below
// ====================================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// ============ WIFI CONFIGURATION ============
// TODO: Replace these with your actual WiFi credentials
const char* ssid = "YOUR_WIFI_NAME";          // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";  // Your WiFi password

// ============ BACKEND URL ============
// TODO: Replace YOUR_COMPUTER_IP with your actual IP address
// To find your IP: Open Command Prompt and type "ipconfig"
// Look for "IPv4 Address" (something like 192.168.1.100)
const char* serverUrl = "http://192.168.1.100:8000/sensor-data";

// ============ HARDWARE PINS ============
#define DHTPIN 23        // DHT11 data pin (GPIO 23)
#define DHTTYPE DHT11    // DHT11 sensor
#define BUZZER_PIN 25    // Buzzer pin (GPIO 25)

// ============ SETTINGS ============
#define UPDATE_INTERVAL 5000  // Send data every 5 seconds

DHT dht(DHTPIN, DHTTYPE);
HTTPClient http;
unsigned long lastUpdate = 0;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================");
  Serial.println("  SilkSphere IoT Sensor Node");
  Serial.println("========================================");
  
  // Initialize DHT11 sensor
  dht.begin();
  Serial.println("[✓] DHT11 sensor initialized");
  
  // Initialize buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("[✓] Buzzer initialized");
  
  // Startup beep
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);
  
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
    Serial.println("\n[✓] WiFi connected!");
    Serial.print("[*] IP Address: ");
    Serial.println(WiFi.localIP());
    
    // Success beeps
    for (int i = 0; i < 3; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(50);
      digitalWrite(BUZZER_PIN, LOW);
      delay(50);
    }
  } else {
    Serial.println("\n[✗] WiFi connection failed!");
    Serial.println("[*] Will continue with offline logging");
    
    // Error beep
    digitalWrite(BUZZER_PIN, HIGH);
    delay(500);
    digitalWrite(BUZZER_PIN, LOW);
  }
  
  Serial.println("\n========================================");
  Serial.println("Starting sensor readings...\n");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Check if it's time to read sensors
  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = currentMillis;
    
    // Read DHT11 sensor
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
    // Check if sensor is working
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("[✗] Failed to read from DHT sensor! Check wiring.");
      return;
    }
    
    // Print readings to Serial Monitor
    Serial.println("┌─────────────────────────────┐");
    Serial.print("│ Temperature: ");
    Serial.print(temperature, 1);
    Serial.println("°C");
    Serial.print("│ Humidity:    ");
    Serial.print(humidity, 1);
    Serial.println("%");
    Serial.println("└─────────────────────────────┘");
    
    // Check temperature alert (your original logic)
    if (temperature > 32.0) {
      Serial.println("[⚠] Temperature HIGH! Buzzer alert!");
      digitalWrite(BUZZER_PIN, HIGH);
      delay(100);
      digitalWrite(BUZZER_PIN, LOW);
    }
    
    // Send data to backend if WiFi is connected
    if (WiFi.status() == WL_CONNECTED) {
      sendDataToBackend(temperature, humidity);
    } else {
      Serial.println("[*] Offline - data not sent to backend");
    }
    
    Serial.println();
  }
}

void sendDataToBackend(float temp, float humidity) {
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create simple JSON string
  String jsonData = "{";
  jsonData += "\"temperature\":" + String(temp, 1) + ",";
  jsonData += "\"humidity\":" + String(humidity, 1) + ",";
  jsonData += "\"co2\":900,";  // Placeholder CO2 value
  jsonData += "\"node_id\":\"ESP32-DHT11\",";
  jsonData += "\"timestamp\":" + String(millis() / 1000);
  jsonData += "}";
  
  Serial.print("[*] Sending: ");
  Serial.println(jsonData);
  
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode > 0) {
    Serial.print("[✓] Backend responded: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("[✗] Error: ");
    Serial.println(http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}
