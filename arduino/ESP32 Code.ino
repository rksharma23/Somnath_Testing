#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <Preferences.h>

// Configuration constants
const char* DEFAULT_SSID = "Som";
const char* DEFAULT_PASSWORD = "Password123";
const char* DEFAULT_SERVER_HOST = "10.107.255.99"; // My Phones IP
const int DEFAULT_SERVER_PORT = 3001;
const char* DEFAULT_BIKE_ID = "BIKE001";

// Server endpoints
const char* API_ENDPOINT = "/api/bike/data";
const char* HEALTH_ENDPOINT = "/health";

// Location constants (Mumbai)
const float BASE_LATITUDE = 19.0760;
const float BASE_LONGITUDE = 72.8777;
const float LOCATION_OFFSET_MAX = 0.005;

// Speed constants (km/h)
const float MIN_SPEED = 12.0;
const float MAX_SPEED = 28.0;

// Battery constants
const int INITIAL_BATTERY = 70;
const int LOW_BATTERY_THRESHOLD = 30;
const int BATTERY_RESET_LEVEL = 70;

// Timing constants (milliseconds)
const unsigned long DATA_SEND_INTERVAL = 5000;
const unsigned long BATTERY_UPDATE_INTERVAL = 30000;
const unsigned long WIFI_CONNECT_TIMEOUT = 30000;
const unsigned long HTTP_TIMEOUT = 10000;
const unsigned long HEALTH_CHECK_TIMEOUT = 5000;

// Error handling constants
const int MAX_CONSECUTIVE_ERRORS = 5;
const int HEALTH_CHECK_FREQUENCY = 10;
const int MAX_WIFI_RETRIES = 3;

// JSON buffer size
const size_t JSON_BUFFER_SIZE = 512;

// NTP servers
const char* NTP_SERVER1 = "pool.ntp.org";
const char* NTP_SERVER2 = "time.nist.gov";
const char* NTP_SERVER3 = "time.google.com";

// Configuration storage
Preferences preferences;

// Runtime variables
struct Config {
  String ssid;
  String password;
  String serverHost;
  int serverPort;
  String bikeId;
} config;

struct BikeData {
  float avgSpeed;
  float lat;
  float lng;
  int battery;
  String timestamp;
};

// State variables
int currentBattery = INITIAL_BATTERY;
int sendCount = 0;
unsigned long lastSendTime = 0;
unsigned long lastBatteryUpdate = 0;
bool serverHealthy = false;
int consecutiveErrors = 0;
int wifiRetryCount = 0;
bool timeInitialized = false;

// Function declarations
void loadConfiguration();
void saveConfiguration();
void connectToWiFi();
void initializeTime();
void checkServerHealth();
void sendBikeData();
BikeData generateBikeData();
void updateBatteryLevel(unsigned long currentMillis);
String getCurrentTimeString();
String buildServerUrl(const char* endpoint);
void printSystemInfo();
void handleWiFiReconnection();
bool isValidConfig();
void enterDeepSleep();

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("🚴 ESP32-S3 Bike Simulator Starting...");
  Serial.println("======================================");
  
  // Print system information
  printSystemInfo();
  
  // Load configuration
  loadConfiguration();
  
  // Validate configuration
  if (!isValidConfig()) {
    Serial.println("❌ Invalid configuration. Please check settings.");
    delay(5000);
    ESP.restart();
  }
  
  // Initialize Wi-Fi
  connectToWiFi();
  
  // Initialize random seed with multiple sources
  randomSeed(analogRead(0) + analogRead(1) + esp_random());
  
  // Set up time synchronization
  initializeTime();
  
  // Initial server health check
  checkServerHealth();
  
  Serial.println("✅ Setup complete. Starting bike data transmission...");
  Serial.println("Press reset button to restart.");
  Serial.println("======================================");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Handle WiFi reconnection
  handleWiFiReconnection();
  
  // Send bike data at regular intervals
  if (currentMillis - lastSendTime >= DATA_SEND_INTERVAL) {
    lastSendTime = currentMillis;
    sendBikeData();
    updateBatteryLevel(currentMillis);
    
    // Periodic server health check
    if (sendCount % HEALTH_CHECK_FREQUENCY == 0) {
      checkServerHealth();
    }
  }
  
  // Check if we should enter deep sleep (low battery + consecutive errors)
  if (currentBattery < LOW_BATTERY_THRESHOLD && consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    Serial.println("🔋 Low battery and connection issues. Entering deep sleep...");
    enterDeepSleep();
  }
  
  delay(100); // Prevent watchdog issues
}

void loadConfiguration() {
  preferences.begin("bike-config", false);
  
  config.ssid = preferences.getString("ssid", DEFAULT_SSID);
  config.password = preferences.getString("password", DEFAULT_PASSWORD);
  config.serverHost = preferences.getString("server_host", DEFAULT_SERVER_HOST);
  config.serverPort = preferences.getInt("server_port", DEFAULT_SERVER_PORT);
  config.bikeId = preferences.getString("bike_id", DEFAULT_BIKE_ID);
  
  Serial.println("📋 Configuration loaded:");
  Serial.println("   SSID: " + config.ssid);
  Serial.println("   Server: " + config.serverHost + ":" + String(config.serverPort));
  Serial.println("   Bike ID: " + config.bikeId);
  
  preferences.end();
}

void saveConfiguration() {
  preferences.begin("bike-config", false);
  
  preferences.putString("ssid", config.ssid);
  preferences.putString("password", config.password);
  preferences.putString("server_host", config.serverHost);
  preferences.putInt("server_port", config.serverPort);
  preferences.putString("bike_id", config.bikeId);
  
  preferences.end();
  Serial.println("💾 Configuration saved");
}

bool isValidConfig() {
  return !config.ssid.isEmpty() && 
         !config.password.isEmpty() && 
         !config.serverHost.isEmpty() && 
         config.serverPort > 0 && 
         config.serverPort < 65536 &&
         !config.bikeId.isEmpty();
}

void connectToWiFi() {
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(config.ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(config.ssid.c_str(), config.password.c_str());
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && 
         (millis() - startTime) < WIFI_CONNECT_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected successfully!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    wifiRetryCount = 0;
  } else {
    Serial.println();
    Serial.println("❌ WiFi connection failed!");
    wifiRetryCount++;
    
    if (wifiRetryCount >= MAX_WIFI_RETRIES) {
      Serial.println("🔄 Maximum WiFi retries reached. Restarting...");
      delay(5000);
      ESP.restart();
    } else {
      Serial.println("🔄 Retrying WiFi connection in 5 seconds...");
      delay(5000);
      connectToWiFi();
    }
  }
}

void handleWiFiReconnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("📡 WiFi disconnected. Attempting to reconnect...");
    connectToWiFi();
  }
}

void initializeTime() {
  Serial.println("🕐 Initializing time synchronization...");
  
  // Configure NTP with multiple servers
  configTime(0, 0, NTP_SERVER1, NTP_SERVER2, NTP_SERVER3);
  
  // Wait for time to be set
  int retries = 0;
  while (!timeInitialized && retries < 20) {
    time_t now = time(nullptr);
    if (now > 1000000000) { // Valid timestamp
      timeInitialized = true;
      Serial.println("✅ Time synchronized successfully");
      Serial.println("📅 Current time: " + getCurrentTimeString());
      break;
    }
    delay(1000);
    retries++;
    Serial.print(".");
  }
  
  if (!timeInitialized) {
    Serial.println("⚠️ Time synchronization failed. Using system time.");
  }
}

String buildServerUrl(const char* endpoint) {
  return "http://" + config.serverHost + ":" + String(config.serverPort) + endpoint;
}

void checkServerHealth() {
  if (WiFi.status() != WL_CONNECTED) {
    serverHealthy = false;
    Serial.println("📡 Cannot check server health - WiFi disconnected");
    return;
  }
  
  HTTPClient http;
  String healthUrl = buildServerUrl(HEALTH_ENDPOINT);
  
  http.begin(healthUrl);
  http.setTimeout(HEALTH_CHECK_TIMEOUT);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    serverHealthy = true;
    Serial.println("💚 Server health check: OK");
  } else {
    serverHealthy = false;
    Serial.print("💔 Server health check failed. URL: ");
    Serial.print(healthUrl);
    Serial.print(" Code: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void sendBikeData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("📡 WiFi not connected. Skipping data send.");
    consecutiveErrors++;
    return;
  }
  
  HTTPClient http;
  String serverUrl = buildServerUrl(API_ENDPOINT);
  
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT);
  
  // Generate realistic bike data
  BikeData data = generateBikeData();
  
  // Create JSON payload with proper error handling
  StaticJsonDocument<JSON_BUFFER_SIZE> doc;
  doc["bikeId"] = config.bikeId;
  doc["data"]["avgSpeed"] = data.avgSpeed;
  doc["data"]["location"]["lat"] = data.lat;
  doc["data"]["location"]["lng"] = data.lng;
  doc["data"]["battery"] = data.battery;
  doc["data"]["timestamp"] = data.timestamp;
  
  String jsonPayload;
  if (serializeJson(doc, jsonPayload) == 0) {
    Serial.println("❌ Failed to serialize JSON");
    consecutiveErrors++;
    http.end();
    return;
  }
  
  // Send the data
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    if (httpResponseCode == 200) {
      consecutiveErrors = 0;
      Serial.print("✅ [");
      Serial.print(data.timestamp);
      Serial.print("] ");
      Serial.print(config.bikeId);
      Serial.print(" - Status: ");
      Serial.print(httpResponseCode);
      Serial.print(" | Battery: ");
      Serial.print(currentBattery);
      Serial.print("% | Speed: ");
      Serial.print(data.avgSpeed, 1);
      Serial.println(" km/h");
    } else {
      consecutiveErrors++;
      Serial.print("⚠️ Unexpected response code: ");
      Serial.print(httpResponseCode);
      Serial.print(" URL: ");
      Serial.println(serverUrl);
    }
  } else {
    consecutiveErrors++;
    Serial.print("❌ Error sending data: ");
    Serial.print(http.errorToString(httpResponseCode));
    Serial.print(" URL: ");
    Serial.println(serverUrl);
  }
  
  http.end();
  sendCount++;
  
  // Handle excessive errors
  if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    Serial.println("🔍 Too many consecutive errors. Checking server health...");
    checkServerHealth();
    
    if (!serverHealthy) {
      Serial.println("⚠️ Server appears to be down. Continuing with reduced frequency...");
    }
  }
}

BikeData generateBikeData() {
  BikeData data;
  
  // Generate realistic speed with more variation
  float speedVariation = (float)random(0, 100) / 100.0; // 0.0 to 1.0
  data.avgSpeed = MIN_SPEED + (speedVariation * (MAX_SPEED - MIN_SPEED));
  
  // Generate location with small random offset
  float latOffset = ((float)random(-500, 500)) / 100000.0;
  float lngOffset = ((float)random(-500, 500)) / 100000.0;
  
  data.lat = BASE_LATITUDE + latOffset;
  data.lng = BASE_LONGITUDE + lngOffset;
  data.battery = currentBattery;
  data.timestamp = getCurrentTimeString();
  
  return data;
}

void updateBatteryLevel(unsigned long currentMillis) {
  // Battery drain logic: decrease based on time or send count
  bool shouldUpdateBattery = (sendCount >= 5) || 
                            ((currentMillis - lastBatteryUpdate) >= BATTERY_UPDATE_INTERVAL);
  
  if (shouldUpdateBattery) {
    currentBattery = max(0, currentBattery - 1); // Ensure battery doesn't go below 0
    sendCount = 0;
    lastBatteryUpdate = currentMillis;
    
    if (currentBattery <= LOW_BATTERY_THRESHOLD) {
      Serial.println("🔋 Low battery warning: " + String(currentBattery) + "%");
      
      if (currentBattery == 0) {
        currentBattery = BATTERY_RESET_LEVEL;
        Serial.println("🔋 Battery reset to " + String(BATTERY_RESET_LEVEL) + "% (simulating charge)");
      }
    }
  }
}

String getCurrentTimeString() {
  if (!timeInitialized) {
    return "Time not available";
  }
  
  time_t now;
  struct tm timeinfo;
  
  if (!getLocalTime(&timeinfo)) {
    return "Time sync error";
  }
  
  char timeBuffer[64];
  strftime(timeBuffer, sizeof(timeBuffer), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeBuffer);
}

void printSystemInfo() {
  Serial.println("📊 System Information:");
  Serial.println("   Chip Model: " + String(ESP.getChipModel()));
  Serial.println("   Chip Revision: " + String(ESP.getChipRevision()));
  Serial.println("   CPU Frequency: " + String(ESP.getCpuFreqMHz()) + " MHz");
  Serial.println("   Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
  Serial.println("   Flash Size: " + String(ESP.getFlashChipSize()) + " bytes");
  Serial.println("   SDK Version: " + String(ESP.getSdkVersion()));
  Serial.println("======================================");
}

void enterDeepSleep() {
  Serial.println("😴 Entering deep sleep for 60 seconds...");
  Serial.flush();
  
  // Wake up after 60 seconds
  esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 seconds in microseconds
  esp_deep_sleep_start();
}