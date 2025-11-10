/**
 * Hook customizado para escutar eventos RFID via Server-Sent Events
 */

import { useEffect, useRef, useState } from "react"

type RFIDEvent =
  | { type: "connected"; sessionId: string }
  | { type: "heartbeat"; timestamp: number }
  | { type: "card_read"; cardId: string; timestamp: number }
  | { type: "error"; message: string; timestamp: number }
  | { type: "close" }

type UseRFIDStreamResult = {
  cardId: string | null
  isConnected: boolean
  error: string | null
  isListening: boolean
}

export function useRFIDStream(sessionId: string | null, enabled = true): UseRFIDStreamResult {
  const [cardId, setCardId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const hasReceivedCard = useRef(false)

  useEffect(() => {
    if (!sessionId || !enabled) {
      return
    }

    console.log(`🎧 [USE-RFID-STREAM] Iniciando escuta RFID para sessão: ${sessionId}`)
    setIsListening(true)
    setError(null)
    hasReceivedCard.current = false // Reset flag

    const url = `/api/rfid/stream?sessionId=${encodeURIComponent(sessionId)}`
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log("✅ Conexão SSE estabelecida")
    }

    eventSource.onmessage = (event) => {
      try {
        const data: RFIDEvent = JSON.parse(event.data)
        console.log("📨 Evento RFID:", data)

        switch (data.type) {
          case "connected":
            setIsConnected(true)
            break

          case "heartbeat":
            // Mantém conexão viva, não faz nada
            break

          case "card_read":
            // Processa apenas uma vez por sessão
            if (!hasReceivedCard.current) {
              console.log(`💳 [USE-RFID-STREAM] Card lido: ${data.cardId}`)
              setCardId(data.cardId)
              hasReceivedCard.current = true
            }
            setIsListening(false)
            eventSource.close()
            break

          case "error":
            console.error(`❌ Erro RFID: ${data.message}`)
            setError(data.message)
            setIsListening(false)
            eventSource.close()
            break

          case "close":
            setIsListening(false)
            eventSource.close()
            break
        }
      } catch (err) {
        console.error("❌ Erro ao processar evento:", err)
      }
    }

    eventSource.onerror = (err) => {
      console.error("❌ Erro na conexão SSE:", err)
      setError("Erro de conexão com o servidor")
      setIsConnected(false)
      setIsListening(false)
      eventSource.close()
    }

    // Cleanup
    return () => {
      console.log("🔌 Fechando conexão SSE")
      eventSource.close()
      setIsListening(false)
      setIsConnected(false)
    }
  }, [sessionId, enabled])

  return {
    cardId,
    isConnected,
    error,
    isListening,
  }
}

