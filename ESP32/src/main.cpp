#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Configuración WiFi
#define WIFI_SSID "Verdura"
#define WIFI_PASSWORD "123456789"

// Firebase
#define API_KEY "AIzaSyDi4lC3s-prf_OLtvw4zwUj26obuotnQUI"
#define DATABASE_URL "https://alarmasmart-204e2-default-rtdb.firebaseio.com/"

// Firebase objetos
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Configuración local
#define LED_PIN 26  // Pin donde está conectado el LED
#define UBICACION_ID "-OVeornA5YmJepEQbCGj" //se cambia por el ID de la ubicación
#define LED_STATE_PATH "ubicaciones/" UBICACION_ID "/ledState" // Ruta en la base de datos para el estado del LED

int estadoActual = 0;  // 0 = apagado, 1 = encendido
bool signupOK = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nWi-Fi conectado.");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Autenticación exitosa.");
    signupOK = true;
  } else {
    Serial.printf("Error de autenticación: %s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Verificar si existe el nodo
  if (Firebase.RTDB.getInt(&fbdo, LED_STATE_PATH)) {
    estadoActual = fbdo.intData();
    digitalWrite(LED_PIN, estadoActual);
    Serial.printf("Estado inicial del LED: %d\n", estadoActual);
  } else {
    Serial.println("No se pudo leer el estado inicial del LED");
    Serial.println("Razón: " + fbdo.errorReason());
  }
}

void loop() {
  if (Firebase.ready() && signupOK) {
    if (Firebase.RTDB.getInt(&fbdo, LED_STATE_PATH)) {
      int nuevoEstado = fbdo.intData();
      
      if (nuevoEstado != estadoActual) {
        estadoActual = nuevoEstado;
        digitalWrite(LED_PIN, estadoActual);
        Serial.print("LED ");
        Serial.println(estadoActual ? "ENCENDIDO" : "APAGADO");
      }
    } else {
      Serial.println("Error al leer estado del LED:");
      Serial.println("Razón: " + fbdo.errorReason());
    }
  }

  delay(500);
}