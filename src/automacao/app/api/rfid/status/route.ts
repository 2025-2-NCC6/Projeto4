/**
 * API Route: GET /api/rfid/status
 * Retorna status do serviço RFID e MQTT
 */

import { NextResponse } from "next/server"
import { getMQTTService } from "@/lib/mqtt/mqtt-client"
import { getRFIDService } from "@/lib/services/rfid.service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const mqttService = getMQTTService()
    const rfidService = getRFIDService()

    const stats = rfidService.getStats()
    const lastCard = rfidService.getLastCardRead()

    return NextResponse.json({
      success: true,
      mqtt: {
        connected: mqttService.isConnected(),
      },
      rfid: {
        pendingCards: stats.pendingCards,
        activeSessions: stats.activeSessions,
        lastCardRead: lastCard
          ? {
              cardId: lastCard.cardId,
              timestamp: lastCard.timestamp,
              totemId: lastCard.totemId,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao obter status:", error)
    return NextResponse.json({ error: "Erro ao obter status" }, { status: 500 })
  }
}

