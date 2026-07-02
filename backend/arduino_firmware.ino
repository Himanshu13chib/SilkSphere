// ====================================================================
// SilkSphere IoT Sensor Node - Arduino/ESP32 Firmware
// ====================================================================
// Hardware: ESP32/ESP8266 with DHT22 (temp/humidity) + MQ135 (CO2/gas)
// Sends sensor readings to FastAPI backend via HTTP POST
// ====================================================================

#include <WiFi.h>           // For ESP32 (use <ESP8266WiFi.h> for ESP8266)
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ============ CONFIGURATION ============
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password
const char* serverUrl = "http://YOUR_BACKEND_IP:8000/sensor-data";  // Replace with your backend URL

// Pin Configuration
#define DHTPIN 4          // DHT22 data pin (GPIO 4)
#define DHTTYPE DHT22     // DHT sensor type
#define MQ135_PIN 34      // MQ-135 analog pin (GPIO 34 for ESP32)

// Sensor Update Interval
#define UPDATE_INTERVAL 5000  // Send data every 5 seconds

DHT dht(DHTPIN, DHTTYPE);
HTTPClient http;
unsigned long lastUpdate = 0;

// ============ SETUP ============
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=================================");
  Serial.println("SilkSphere IoT Sensor Node v1.0");
  Serial.println("=================================");
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("[✓] DHT22 sensor initialized");
  
  // Connect to WiFi
  Serial.print("[*] Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[✓] WiFi connected!");
    Serial.print("[*] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[✗] WiFi connection failed!");
  }
}

// ============ MAIN LOOP ============
void loop() {
  unsigned long currentMillis = millis();
  
  // Check if it's time to send data
  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = currentMillis;
    
    // Read sensors
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int co2Raw = analogRead(MQ135_PIN);
    
    // Convert MQ-135 analog reading to CO2 ppm (calibration required)
    // This is a simplified conversion - calibrate for your specific sensor
    float co2 = map(co2Raw, 0, 4095, 400, 2000);  // Map to typical indoor CO2 range
    
    // Check if readings are valid
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("[✗] Failed to read from DHT sensor!");
      return;
    }
    
    // Print to Serial Monitor
    Serial.println("\n--- Sensor Readings ---");
    Serial.printf("Temperature: %.1f°C\n", temperature);
    Serial.printf("Humidity: %.1f%%\n", humidity);
    Serial.printf("CO2: %.0f ppm\n", co2);
    
    // Send data to backend
    if (WiFi.status() == WL_CONNECTED) {
      sendDataToBackend(temperature, humidity, co2);
    } else {
      Serial.println("[✗] WiFi not connected - data not sent");
    }
  }
}

// ============ SEND DATA TO BACKEND ============
void sendDataToBackend(float temp, float humidity, float co2) {
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["temperature"] = round(temp * 10) / 10.0;  // Round to 1 decimal
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["co2"] = (int)co2;
  doc["timestamp"] = millis() / 1000;
  doc["node_id"] = "ESP32-001";  // Unique identifier for this sensor node
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  Serial.println("[*] Sending data to backend...");
  Serial.println(jsonPayload);
  
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("[✓] Response code: %d\n", httpResponseCode);
    Serial.printf("[✓] Response: %s\n", response.c_str());
  } else {
    Serial.printf("[✗] Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}

// ============ ADVANCED: MULTI-ZONE SUPPORT ============
// If you have multiple sensor nodes for different zones:
/*
void sendMultiZoneData() {
  StaticJsonDocument<512> doc;
  
  doc["node_id"] = "ESP32-001";
  doc["timestamp"] = millis() / 1000;
  
  // Zone A readings
  doc["zones"]["Zone A"]["temperature"] = readZoneTemp(0);
  doc["zones"]["Zone A"]["humidity"] = readZoneHumidity(0);
  doc["zones"]["Zone A"]["co2"] = readZoneCO2(0);
  
  // Zone B readings
  doc["zones"]["Zone B"]["temperature"] = readZoneTemp(1);
  doc["zones"]["Zone B"]["humidity"] = readZoneHumidity(1);
  doc["zones"]["Zone B"]["co2"] = readZoneCO2(1);
  
  // ... add more zones as needed
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.POST(jsonPayload);
  http.end();
}
*/
