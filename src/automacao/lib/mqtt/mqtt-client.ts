/**
 * MQTT Client para comunicação com HiveMQ Cloud
 * Gerencia conexão e subscrição de tópicos RFID
 */

import mqtt, { MqttClient } from "mqtt"

type RFIDMessage = {
  cardId: string
  timestamp: number
  totemId?: string
}

type MessageHandler = (message: RFIDMessage) => void

class MQTTService {
  private client: MqttClient | null = null
  private messageHandlers: Set<MessageHandler> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://broker.hivemq.com:1883"
      const options = {
        clientId: `nextjs_totem_${Math.random().toString(16).slice(2, 8)}`,
        username: process.env.MQTT_USERNAME || "",
        password: process.env.MQTT_PASSWORD || "",
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
      }

      console.log("🔌 Conectando ao MQTT broker:", brokerUrl)
      
      this.client = mqtt.connect(brokerUrl, options)

      this.client.on("connect", () => {
        console.log("✅ Conectado ao MQTT broker HiveMQ")
        this.reconnectAttempts = 0
        this.subscribeToTopics()
      })

      this.client.on("error", (error) => {
        console.error("❌ Erro MQTT:", error)
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("🛑 Máximo de tentativas de reconexão atingido")
        }
        this.reconnectAttempts++
      })

      this.client.on("message", (topic, payload) => {
        this.handleMessage(topic, payload)
      })

      this.client.on("close", () => {
        console.log("🔌 Conexão MQTT fechada")
      })

      this.client.on("reconnect", () => {
        console.log("🔄 Reconectando ao MQTT...")
      })
    } catch (error) {
      console.error("❌ Erro ao criar cliente MQTT:", error)
    }
  }

  private subscribeToTopics() {
    if (!this.client) return

    const topic = process.env.MQTT_TOPIC_RFID || "totem/rfid/+"
    
    this.client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ Erro ao subscrever tópico:", err)
      } else {
        console.log(`📡 Subscrito ao tópico: ${topic}`)
      }
    })
  }

  private handleMessage(topic: string, payload: Buffer) {
    try {
      const message = payload.toString()
      console.log(`📨 [MQTT-CLIENT] Mensagem recebida [${topic}]:`, message)

      const data = JSON.parse(message) as RFIDMessage

      // Valida estrutura da mensagem
      if (!data.cardId) {
        console.warn("⚠️ Mensagem RFID sem cardId:", data)
        return
      }

      console.log(`📢 [MQTT-CLIENT] Notificando ${this.messageHandlers.size} handler(s)...`)
      
      // Notifica todos os handlers registrados
      let handlerIndex = 0
      this.messageHandlers.forEach((handler) => {
        try {
          handlerIndex++
          console.log(`  → [MQTT-CLIENT] Executando handler ${handlerIndex}/${this.messageHandlers.size}`)
          handler(data)
        } catch (error) {
          console.error("❌ Erro ao executar handler:", error)
        }
      })
    } catch (error) {
      console.error("❌ Erro ao processar mensagem MQTT:", error)
    }
  }

  /**
   * Registra um handler para receber mensagens RFID
   */
  public onRFIDMessage(handler: MessageHandler): () => void {
    console.log(`📝 [MQTT-CLIENT] Registrando novo handler. Total de handlers: ${this.messageHandlers.size + 1}`)
    this.messageHandlers.add(handler)
    
    // Retorna função para remover o handler
    return () => {
      console.log(`🗑️ [MQTT-CLIENT] Removendo handler. Total de handlers: ${this.messageHandlers.size - 1}`)
      this.messageHandlers.delete(handler)
    }
  }

  /**
   * Publica uma mensagem em um tópico
   */
  public publish(topic: string, message: object | string) {
    if (!this.client) {
      console.warn("⚠️ Cliente MQTT não conectado")
      return
    }

    const payload = typeof message === "string" ? message : JSON.stringify(message)
    
    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ Erro ao publicar mensagem:", err)
      } else {
        console.log(`📤 Mensagem publicada [${topic}]:`, payload)
      }
    })
  }

  /**
   * Desconecta do broker MQTT
   */
  public disconnect() {
    if (this.client) {
      this.client.end()
      this.client = null
      console.log("🔌 Cliente MQTT desconectado")
    }
  }

  /**
   * Verifica se está conectado
   */
  public isConnected(): boolean {
    return this.client?.connected || false
  }
}

// Singleton instance usando globalThis para garantir uma única instância
// mesmo com hot reload do Next.js
const globalForMQTT = globalThis as unknown as {
  mqttService: MQTTService | undefined
}

export function getMQTTService(): MQTTService {
  if (!globalForMQTT.mqttService) {
    console.log(`🔧 Criando singleton GLOBAL MQTTService...`)
    globalForMQTT.mqttService = new MQTTService()
  } else {
    console.log(`♻️  Reutilizando instância GLOBAL do MQTTService`)
  }
  return globalForMQTT.mqttService
}

export type { RFIDMessage, MessageHandler }

