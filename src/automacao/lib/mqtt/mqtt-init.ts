/**
 * Inicializador do serviço MQTT
 * Este arquivo conecta o MQTT client ao RFID service
 */

import { getMQTTService } from "./mqtt-client"
import { getRFIDService } from "@/lib/services/rfid.service"

// Usa globalThis para garantir que só inicialize uma vez mesmo com hot reload
const globalForInit = globalThis as unknown as {
  mqttInitialized: boolean | undefined
  mqttHandlerRegistered: boolean | undefined
}

export function initializeMQTT() {
  if (globalForInit.mqttInitialized) {
    console.log("⚠️ [MQTT-INIT] MQTT já inicializado GLOBALMENTE")
    return
  }

  console.log("🚀 [MQTT-INIT] Inicializando serviço MQTT GLOBAL...")

  const mqttService = getMQTTService()
  const rfidService = getRFIDService()
  
  console.log("🔗 [MQTT-INIT] Conectando MQTT Service ao RFID Service...")

  // Registra handler APENAS UMA VEZ
  if (!globalForInit.mqttHandlerRegistered) {
    console.log("📝 [MQTT-INIT] Registrando handler ÚNICO...")
    
    mqttService.onRFIDMessage((message) => {
      console.log("📨 [MQTT-INIT] Mensagem RFID recebida:", message)
      rfidService.registerCardRead(message)
    })
    
    globalForInit.mqttHandlerRegistered = true
    console.log("✅ [MQTT-INIT] Handler registrado com sucesso")
  } else {
    console.log("⚠️ [MQTT-INIT] Handler já estava registrado, pulando...")
  }

  globalForInit.mqttInitialized = true
  console.log("✅ [MQTT-INIT] Serviço MQTT inicializado com sucesso GLOBALMENTE")
}

// Auto-inicializa no servidor
if (typeof window === "undefined") {
  initializeMQTT()
}

