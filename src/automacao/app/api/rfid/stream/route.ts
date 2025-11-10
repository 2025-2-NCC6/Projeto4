/**
 * API Route: GET /api/rfid/stream
 * Server-Sent Events para comunicação real-time de leitura RFID
 */

import { NextRequest } from "next/server"
import { getRFIDService } from "@/lib/services/rfid.service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId")

  if (!sessionId) {
    return new Response("sessionId é obrigatório", { status: 400 })
  }

  // Criar stream para Server-Sent Events
  const encoder = new TextEncoder()
  
  // Variável de controle compartilhada entre start() e cancel()
  let isClosed = false
  
  const stream = new ReadableStream({
    async start(controller) {
      console.log(`📡 [SSE-STREAM] Iniciando stream SSE para sessão: ${sessionId}`)

      const rfidService = getRFIDService()
      console.log(`📡 [SSE-STREAM] RFIDService obtido para sessão ${sessionId}`)

      // Envia heartbeat a cada 15 segundos para manter conexão viva
      const heartbeatInterval = setInterval(() => {
        if (!isClosed) {
          try {
            const data = `data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.log(`⚠️ Heartbeat falhou (stream já fechado): ${sessionId}`)
            clearInterval(heartbeatInterval)
          }
        }
      }, 15000)

      // Envia status inicial
      const initialData = `data: ${JSON.stringify({ type: "connected", sessionId })}\n\n`
      controller.enqueue(encoder.encode(initialData))

      // Loop infinito para múltiplas leituras
      const loopLeituras = async () => {
        while (!isClosed) {
          try {
            // Aguarda por um card (timeout de 30 segundos por leitura)
            const cardId = await rfidService.waitForCard(sessionId, 30000)

            console.log(`✅ Card lido para sessão ${sessionId}: ${cardId}`)

            if (!isClosed) {
              // Envia card lido para o cliente
              const cardData = `data: ${JSON.stringify({ type: "card_read", cardId, timestamp: Date.now() })}\n\n`
              controller.enqueue(encoder.encode(cardData))

              // Consome o card (remove do pool de pendentes)
              rfidService.consumeCard(cardId)
            }
          } catch (error) {
            // Timeout na espera por um card específico - continua esperando
            if (!isClosed) {
              console.log(`⏱️ Timeout aguardando cartão na sessão ${sessionId} (continuando...)`)
            }
          }

          // Pequeno delay antes de aguardar próximo card
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      try {
        await loopLeituras()
      } finally {
        clearInterval(heartbeatInterval)
        isClosed = true
        
        // Fecha o stream
        try {
          const closeData = `data: ${JSON.stringify({ type: "close" })}\n\n`
          controller.enqueue(encoder.encode(closeData))
          controller.close()
          console.log(`🔌 Stream SSE fechado para sessão: ${sessionId}`)
        } catch (error) {
          console.log(`⚠️ Stream já estava fechado: ${sessionId}`)
        }
      }
    },

    cancel() {
      console.log(`🔌 Stream SSE cancelado pelo cliente: ${sessionId}`)
      isClosed = true
      const rfidService = getRFIDService()
      rfidService.cancelWait(sessionId || "")
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Desabilita buffering no Nginx
    },
  })
}

