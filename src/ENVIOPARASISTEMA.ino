#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// ==================== CONFIGURAÇÕES ====================
// WiFi
const char* WIFI_SSID = "iphone";
const char* WIFI_PASSWORD = "teste1234";

// MQTT (HiveMQ Cloud)
const char* MQTT_SERVER = "afd5d7922ab644eda64903ea94c2ec55.s1.eu.hivemq.cloud";
const int MQTT_PORT = 8883; // TLS
const char* MQTT_USER = "fecap";
const char* MQTT_PASSWORD = "Teste1230102";
const char* TOTEM_ID = "totem_01";
String MQTT_TOPIC = "totem/rfid/" + String(TOTEM_ID);

// Pinos RFID (NodeMCU)
#define RST_PIN D4 
#define SS_PIN  D8  

// ==================== OBJETOS ====================
MFRC522 rfid(SS_PIN, RST_PIN);
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

// ==================== VARIÁVEIS ====================
String lastCardId = "";
unsigned long lastReadTime = 0;
const unsigned long DEBOUNCE_TIME = 2000; // 2s entre leituras iguais
unsigned long lastMqttAttempt = 0;
const unsigned long MQTT_RECONNECT_INTERVAL = 5000;

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println("\n========================================");
  Serial.println(" ESP8266 RFID TOTEM - HiveMQ Cloud ");
  Serial.println("========================================\n");

  // Inicializa SPI e RFID
  SPI.begin();
  rfid.PCD_Init();
  rfid.PCD_DumpVersionToSerial();
  Serial.println(" Leitor RFID inicializado");

  // Conecta WiFi
  connectWiFi();

  // Configura MQTT (TLS)
  espClient.setInsecure();
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);

  Serial.println("\n Sistema iniciado, aguardando cartões...\n");
}

// ==================== LOOP PRINCIPAL ====================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!mqttClient.connected()) {
    unsigned long now = millis();
    if (now - lastMqttAttempt > MQTT_RECONNECT_INTERVAL) {
      lastMqttAttempt = now;
      reconnectMQTT();
    }
  } else {
    mqttClient.loop();
  }

  readRFIDCard();
  delay(50);
}

// ==================== CONEXÃO WIFI ====================
void connectWiFi() {
  Serial.print(" Conectando WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// ==================== CONEXÃO MQTT ====================
void reconnectMQTT() {
  Serial.print("📡 Conectando HiveMQ... ");
  String clientId = "ESP8266_" + String(TOTEM_ID) + "_" + String(random(0xffff), HEX);

  if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
    Serial.println(" Conectado ao HiveMQ Cloud!");
    publishSystemStatus("online");
  } else {
    Serial.print(" Falha MQTT (rc=");
    Serial.print(mqttClient.state());
    Serial.println(")");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print(" Mensagem recebida [");
  Serial.print(topic);
  Serial.print("]: ");
  for (unsigned int i = 0; i < length; i++) Serial.print((char)payload[i]);
  Serial.println();
}

void publishSystemStatus(String status) {
  StaticJsonDocument<200> doc;
  doc["totemId"] = TOTEM_ID;
  doc["status"] = status;
  doc["ip"] = WiFi.localIP().toString();
  doc["timestamp"] = millis();

  char buffer[200];
  serializeJson(doc, buffer);
  String topic = "totem/status/" + String(TOTEM_ID);
  mqttClient.publish(topic.c_str(), buffer, true);
}

// ==================== RFID ====================
void readRFIDCard() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  String cardId = getCardUID();
  unsigned long now = millis();

  if (cardId != lastCardId || (now - lastReadTime) > DEBOUNCE_TIME) {
    Serial.println("\n Cartão detectado!");
    Serial.print("UID: ");
    Serial.println(cardId);

    if (mqttClient.connected()) {
      publishCardRead(cardId);
    } else {
      Serial.println(" MQTT desconectado! Tentando reconectar...");
      reconnectMQTT();
    }

    lastCardId = cardId;
    lastReadTime = now;
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

String getCardUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (i > 0) uid += ":";
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void publishCardRead(String cardId) {
  StaticJsonDocument<256> doc;
  doc["cardId"] = cardId;
  doc["timestamp"] = millis();
  doc["totemId"] = TOTEM_ID;

  char buffer[256];
  serializeJson(doc, buffer);

  mqttClient.publish(MQTT_TOPIC.c_str(), buffer, false);
  Serial.println(" Publicado no HiveMQ: " + String(buffer));
}
