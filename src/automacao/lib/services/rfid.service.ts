/**
 * Serviço de gerenciamento de eventos RFID
 * Mantém estado de cards pendentes e sessões ativas
 */

import { RFIDMessage } from "@/lib/mqtt/mqtt-client"
import { LogService } from "./log.service"

type PendingCard = {
  cardId: string
  timestamp: number
  totemId?: string
}

type SessionHandler = (cardId: string) => void

class RFIDService {
  private pendingCards: Map<string, PendingCard> = new Map()
  private sessionHandlers: Map<string, SessionHandler> = new Map()
  private readonly CARD_EXPIRATION_MS = 60000 // 1 minuto
  private readonly instanceId: string

  constructor() {
    this.instanceId = `rfid_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    console.log(`🆕 Nova instância RFIDService criada: ${this.instanceId}`)
  }

  /**
   * Registra um card lido como pendente
   */
  public registerCardRead(message: RFIDMessage) {
    const pending: PendingCard = {
      cardId: message.cardId,
      timestamp: message.timestamp,
      totemId: message.totemId,
    }

    this.pendingCards.set(message.cardId, pending)
    console.log(`💳 [${this.instanceId}] Card registrado: ${message.cardId}`)
    console.log(`📊 [${this.instanceId}] Estado atual - Sessões ativas: ${this.sessionHandlers.size}, Cards pendentes: ${this.pendingCards.size}`)

    // Registra log da leitura RFID
    LogService.logRFIDRead(message.cardId, message.totemId).catch((error) => {
      console.error("Erro ao registrar log RFID:", error)
    })

    // Notifica handlers de sessão aguardando por um card
    this.notifySessionHandlers(message.cardId)

    // Auto-limpa após expiração
    setTimeout(() => {
      this.pendingCards.delete(message.cardId)
    }, this.CARD_EXPIRATION_MS)
  }

  /**
   * Obtém o último card lido (se existir e não expirou)
   */
  public getLastCardRead(): PendingCard | null {
    // Limpa cards expirados
    const now = Date.now()
    for (const [cardId, card] of this.pendingCards.entries()) {
      if (now - card.timestamp > this.CARD_EXPIRATION_MS) {
        this.pendingCards.delete(cardId)
      }
    }

    // Retorna o card mais recente
    let mostRecent: PendingCard | null = null
    for (const card of this.pendingCards.values()) {
      if (!mostRecent || card.timestamp > mostRecent.timestamp) {
        mostRecent = card
      }
    }

    return mostRecent
  }

  /**
   * Aguarda por um card específico ou qualquer card
   * Retorna uma Promise que resolve quando um card é lido
   */
  public waitForCard(sessionId: string, timeoutMs = 30000): Promise<string> {
    return new Promise((resolve, reject) => {
      // IMPORTANTE: Verifica se já existe um card pendente antes de esperar
      const existingCard = this.getLastCardRead()
      if (existingCard) {
        console.log(`✨ [${this.instanceId}] Card pendente encontrado! ${existingCard.cardId}`)
        // Consome o card imediatamente
        this.consumeCard(existingCard.cardId)
        resolve(existingCard.cardId)
        return
      }

      const timeout = setTimeout(() => {
        this.sessionHandlers.delete(sessionId)
        reject(new Error("Timeout aguardando leitura do cartão"))
      }, timeoutMs)

      const handler: SessionHandler = (cardId: string) => {
        clearTimeout(timeout)
        this.sessionHandlers.delete(sessionId)
        console.log(`🎯 Handler executado! Resolvendo com cardId: ${cardId}`)
        resolve(cardId)
      }

      this.sessionHandlers.set(sessionId, handler)
      console.log(`⏳ [${this.instanceId}] Sessão ${sessionId} aguardando cartão... (Total de sessões: ${this.sessionHandlers.size})`)
    })
  }

  /**
   * Cancela uma sessão aguardando card
   */
  public cancelWait(sessionId: string) {
    this.sessionHandlers.delete(sessionId)
    console.log(`❌ Sessão ${sessionId} cancelada`)
  }

  /**
   * Notifica handlers de sessão sobre um card lido
   */
  private notifySessionHandlers(cardId: string) {
    // Notifica TODAS as sessões aguardando (FIFO - primeira que registrou)
    const handlers = Array.from(this.sessionHandlers.entries())
    console.log(`🔔 Tentando notificar sessões. Total de handlers: ${handlers.length}`)
    
    if (handlers.length > 0) {
      const [sessionId, handler] = handlers[0] // Pega a primeira sessão
      console.log(`✅ Notificando sessão ${sessionId} sobre card ${cardId}`)
      handler(cardId)
    } else {
      console.log(`⚠️  Nenhuma sessão aguardando. Card ${cardId} ficará pendente.`)
    }
  }

  /**
   * Limpa card pendente após ser consumido
   */
  public consumeCard(cardId: string) {
    this.pendingCards.delete(cardId)
    console.log(`✅ Card ${cardId} consumido`)
  }

  /**
   * Estatísticas do serviço
   */
  public getStats() {
    return {
      pendingCards: this.pendingCards.size,
      activeSessions: this.sessionHandlers.size,
    }
  }
}

// Singleton instance usando globalThis para garantir uma única instância
// mesmo com hot reload do Next.js
const globalForRFID = globalThis as unknown as {
  rfidService: RFIDService | undefined
}

export function getRFIDService(): RFIDService {
  if (!globalForRFID.rfidService) {
    console.log(`🔧 Criando singleton GLOBAL RFIDService...`)
    globalForRFID.rfidService = new RFIDService()
  } else {
    console.log(`♻️  Reutilizando instância GLOBAL do RFIDService (${globalForRFID.rfidService['instanceId']})`)
  }
  return globalForRFID.rfidService
}

