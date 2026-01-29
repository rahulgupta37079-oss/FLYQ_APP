/**
 * HTTP Bridge for LiteWing ESP32-S3 Drone
 * Add this to your main firmware to enable HTTP communication from React Native app
 * 
 * This code runs alongside your existing UDP/CRTP server
 * It receives HTTP requests and converts them to CRTP commands
 */

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// Create HTTP server on port 80
WebServer httpServer(80);

// Flight command structure
struct FlightCommand {
    float roll;
    float pitch;
    float yaw;
    float thrust;
};

FlightCommand currentCommand = {0, 0, 0, 0};
bool isArmed = false;

// Your existing CRTP functions (adjust function names as needed)
extern void sendCRTPCommand(float roll, float pitch, float yaw, float thrust);
extern void stopMotors();
extern float getBatteryVoltage();
extern bool getConnectionStatus();

/**
 * Handle /ping endpoint
 * Used to check if drone is reachable
 */
void handlePing() {
    httpServer.send(200, "text/plain", "PONG");
}

/**
 * Handle /command endpoint
 * Receives flight commands from mobile app
 * 
 * Expected JSON format:
 * {
 *   "roll": -30.0 to 30.0,
 *   "pitch": -30.0 to 30.0,
 *   "yaw": -200.0 to 200.0,
 *   "thrust": 0 to 65535
 * }
 */
void handleCommand() {
    if (!httpServer.hasArg("plain")) {
        httpServer.send(400, "text/plain", "No body");
        return;
    }

    String body = httpServer.arg("plain");
    
    // Parse JSON
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, body);
    
    if (error) {
        httpServer.send(400, "text/plain", "Invalid JSON");
        return;
    }

    // Extract command values
    currentCommand.roll = doc["roll"] | 0.0;
    currentCommand.pitch = doc["pitch"] | 0.0;
    currentCommand.yaw = doc["yaw"] | 0.0;
    currentCommand.thrust = doc["thrust"] | 0;

    // Send to CRTP/motors
    if (isArmed) {
        sendCRTPCommand(
            currentCommand.roll,
            currentCommand.pitch,
            currentCommand.yaw,
            currentCommand.thrust
        );
    }

    httpServer.send(200, "text/plain", "OK");
}

/**
 * Handle /telemetry endpoint
 * Returns current drone status to mobile app
 * 
 * Response JSON format:
 * {
 *   "battery": 87.5,
 *   "armed": true,
 *   "connected": true,
 *   "roll": 0.0,
 *   "pitch": 0.0,
 *   "yaw": 0.0,
 *   "thrust": 0
 * }
 */
void handleTelemetry() {
    StaticJsonDocument<256> doc;
    
    doc["battery"] = getBatteryVoltage();
    doc["armed"] = isArmed;
    doc["connected"] = getConnectionStatus();
    doc["roll"] = currentCommand.roll;
    doc["pitch"] = currentCommand.pitch;
    doc["yaw"] = currentCommand.yaw;
    doc["thrust"] = currentCommand.thrust;
    
    String response;
    serializeJson(doc, response);
    
    httpServer.send(200, "application/json", response);
}

/**
 * Handle /arm endpoint
 * Arms or disarms the drone motors
 * 
 * POST body: { "armed": true/false }
 */
void handleArm() {
    if (!httpServer.hasArg("plain")) {
        httpServer.send(400, "text/plain", "No body");
        return;
    }

    String body = httpServer.arg("plain");
    StaticJsonDocument<64> doc;
    DeserializationError error = deserializeJson(doc, body);
    
    if (error) {
        httpServer.send(400, "text/plain", "Invalid JSON");
        return;
    }

    isArmed = doc["armed"] | false;
    
    if (!isArmed) {
        stopMotors();
    }

    httpServer.send(200, "text/plain", isArmed ? "ARMED" : "DISARMED");
}

/**
 * Handle /stop endpoint
 * Emergency stop - immediately disarm and stop all motors
 */
void handleStop() {
    isArmed = false;
    stopMotors();
    currentCommand = {0, 0, 0, 0};
    httpServer.send(200, "text/plain", "STOPPED");
}

/**
 * Handle CORS preflight requests
 * Allows web-based apps to connect
 */
void handleCORS() {
    httpServer.sendHeader("Access-Control-Allow-Origin", "*");
    httpServer.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpServer.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    httpServer.send(200);
}

/**
 * Initialize HTTP server
 * Call this from your setup() function
 */
void setupHTTPServer() {
    // Enable CORS for all routes
    httpServer.enableCORS(true);
    
    // Register endpoints
    httpServer.on("/ping", HTTP_POST, handlePing);
    httpServer.on("/ping", HTTP_GET, handlePing);
    httpServer.on("/command", HTTP_POST, handleCommand);
    httpServer.on("/telemetry", HTTP_GET, handleTelemetry);
    httpServer.on("/arm", HTTP_POST, handleArm);
    httpServer.on("/stop", HTTP_POST, handleStop);
    
    // CORS preflight
    httpServer.on("/command", HTTP_OPTIONS, handleCORS);
    httpServer.on("/telemetry", HTTP_OPTIONS, handleCORS);
    httpServer.on("/arm", HTTP_OPTIONS, handleCORS);
    
    // Start server
    httpServer.begin();
    
    Serial.println("HTTP server started on port 80");
    Serial.println("Endpoints:");
    Serial.println("  POST /ping       - Connection check");
    Serial.println("  POST /command    - Flight commands");
    Serial.println("  GET  /telemetry  - Drone status");
    Serial.println("  POST /arm        - Arm/Disarm");
    Serial.println("  POST /stop       - Emergency stop");
}

/**
 * Process HTTP requests
 * Call this from your loop() function
 */
void processHTTPServer() {
    httpServer.handleClient();
}

/**
 * Example integration with your main code:
 * 
 * void setup() {
 *     // Your existing WiFi setup
 *     WiFi.softAP("LiteWing-001", "password");
 *     
 *     // Your existing UDP/CRTP setup
 *     setupUDP();
 *     setupCRTP();
 *     
 *     // Add HTTP server
 *     setupHTTPServer();
 * }
 * 
 * void loop() {
 *     // Your existing loop code
 *     processUDP();
 *     processCRTP();
 *     
 *     // Add HTTP processing
 *     processHTTPServer();
 * }
 */
