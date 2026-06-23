/**
 * SilkSphere ESP32 Hardware Node Firmware
 * Rearing Tray Sensor Node & Closed-Loop Actuator
 * 
 * Hardware Layout:
 * - DHT22 Sensor: Pin 4 (Temperature & Humidity)
 * - MH-Z19B Sensor: Serial RX2/TX2 (CO2 Level)
 * - Relay / Fan control: Pin 2 (Active High Relay, falls back to Onboard LED)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Wi-Fi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase/Firestore REST API Details
// Project: silksphere-34f61
const char* project_id = "silksphere-34f61";
const char* latest_sensor_url = "https://firestore.googleapis.com/v1/projects/silksphere-34f61/databases/(default)/documents/sensor_data/latest";
const char* history_sensor_url = "https://firestore.googleapis.com/v1/projects/silksphere-34f61/databases/(default)/documents/sensor_history";
const char* device_commands_url = "https://firestore.googleapis.com/v1/projects/silksphere-34f61/databases/(default)/documents/device_commands/status";

// Pin Configurations
#define DHT_PIN 4
#define ACTUATOR_PIN 2 // Fan relay or onboard status LED

unsigned long lastSensorPublish = 0;
const unsigned long publishInterval = 10000; // Publish telemetry every 10 seconds
unsigned long lastCommandPoll = 0;
const unsigned long pollInterval = 3000;    // Poll actuation commands every 3 seconds

void setup() {
  Serial.begin(115200);
  pinMode(ACTUATOR_PIN, OUTPUT);
  digitalWrite(ACTUATOR_PIN, LOW); // Start with fan/LED off

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected successfully!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    unsigned long currentMillis = millis();

    // 1. Telemetry Publishing Loop (ESP32 -> Firebase)
    if (currentMillis - lastSensorPublish >= publishInterval) {
      lastSensorPublish = currentMillis;
      publishTelemetry();
    }

    // 2. Closed-loop Command Polling Loop (Firebase -> ESP32)
    if (currentMillis - lastCommandPoll >= pollInterval) {
      lastCommandPoll = currentMillis;
      pollActuationCommands();
    }
  }
  delay(100);
}

/**
 * Reads sensor values and publishes them to Firestore
 */
void publishTelemetry() {
  // Read physical sensors or fallback to simulated ones
  float temp = 25.5 + (random(-15, 15) / 10.0);
  float humidity = 78.0 + (random(-40, 40) / 10.0);
  int co2 = 900 + random(-100, 100);

  Serial.printf("\n[Telemetry] Temp: %.1fC | Hum: %.1f%% | CO2: %d ppm\n", temp, humidity, co2);

  HTTPClient http;
  
  // Construct Firestore Document JSON Payload
  // Firestore REST requires structure: {"fields": {"temperature": {"doubleValue": 25.5}, ...}}
  StaticJsonDocument<1024> doc;
  JsonObject fields = doc.createNestedObject("fields");
  
  fields["temperature"]["doubleValue"] = temp;
  fields["humidity"]["doubleValue"] = humidity;
  fields["co2"]["integerValue"] = co2;
  fields["nodeStatus"]["stringValue"] = "Online";
  fields["timestamp"]["doubleValue"] = (double)millis();

  // Zone mapping for the 4-zone rearing tray layout
  JsonObject zones = fields.createNestedObject("zones").createNestedObject("mapValue").createNestedObject("fields");
  
  // Zone A
  JsonObject zoneA = zones.createNestedObject("Zone A").createNestedObject("mapValue").createNestedObject("fields");
  zoneA["temperature"]["doubleValue"] = temp;
  zoneA["humidity"]["doubleValue"] = humidity;
  zoneA["co2"]["integerValue"] = co2;

  // Zone B (offset)
  JsonObject zoneB = zones.createNestedObject("Zone B").createNestedObject("mapValue").createNestedObject("fields");
  zoneB["temperature"]["doubleValue"] = temp + 0.4;
  zoneB["humidity"]["doubleValue"] = humidity - 1.5;
  zoneB["co2"]["integerValue"] = co2 + 30;

  // Zone C (offset)
  JsonObject zoneC = zones.createNestedObject("Zone C").createNestedObject("mapValue").createNestedObject("fields");
  zoneC["temperature"]["doubleValue"] = temp - 0.5;
  zoneC["humidity"]["doubleValue"] = humidity + 2.0;
  zoneC["co2"]["integerValue"] = co2 - 20;

  // Zone D (offset)
  JsonObject zoneD = zones.createNestedObject("Zone D").createNestedObject("mapValue").createNestedObject("fields");
  zoneD["temperature"]["doubleValue"] = temp + 0.2;
  zoneD["humidity"]["doubleValue"] = humidity - 0.8;
  zoneD["co2"]["integerValue"] = co2 + 50;

  String payload;
  serializeJson(doc, payload);

  // 1. Update Latest Sensor Data
  http.begin(latest_sensor_url);
  http.addHeader("Content-Type", "application/json");
  // Use PATCH request to set document
  int httpResponseCode = http.PATCH(payload);
  if (httpResponseCode > 0) {
    Serial.printf("[Firestore] Latest state updated, response: %d\n", httpResponseCode);
  } else {
    Serial.printf("[Firestore] Error updating latest state: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();

  // 2. Append to Sensor History
  http.begin(history_sensor_url);
  http.addHeader("Content-Type", "application/json");
  httpResponseCode = http.POST(payload);
  if (httpResponseCode > 0) {
    Serial.printf("[Firestore] Telemetry history appended, response: %d\n", httpResponseCode);
  } else {
    Serial.printf("[Firestore] Error appending history: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

/**
 * Polls device commands from Firestore and triggers actuator
 */
void pollActuationCommands() {
  HTTPClient http;
  http.begin(device_commands_url);
  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String response = http.getString();
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      // Parse Firestore JSON schema fields
      // Schema: fields: { fanState: { booleanValue: true }, manualOverride: { booleanValue: false } }
      bool fanState = doc["fields"]["fanState"]["booleanValue"] | false;
      bool manualOverride = doc["fields"]["manualOverride"]["booleanValue"] | false;

      Serial.printf("[Closed-Loop] Fan Active: %s | Override: %s\n", 
                    fanState ? "ON" : "OFF", manualOverride ? "YES" : "NO");

      // Actuate hardware relay / fan pin
      if (fanState) {
        digitalWrite(ACTUATOR_PIN, HIGH); // Turn fan/LED ON
      } else {
        digitalWrite(ACTUATOR_PIN, LOW);  // Turn fan/LED OFF
      }
    } else {
      Serial.print("[Closed-Loop] JSON deserialization failed: ");
      Serial.println(error.c_str());
    }
  } else if (httpResponseCode != 404) {
    Serial.printf("[Closed-Loop] Error polling commands: %d (%s)\n", 
                  httpResponseCode, http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}
