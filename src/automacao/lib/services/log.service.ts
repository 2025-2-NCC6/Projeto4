/**
 * Serviço de Logs do Sistema
 * Registra eventos importantes na tabela log_sistema
 */

import { prisma } from "@/lib/prisma"

type LogLevel = "info" | "warn" | "error"

export class LogService {
  /**
   * Registra um log no sistema
   */
  static async log(nivel: LogLevel, origem: string, mensagem: string) {
    try {
      await prisma.log_sistema.create({
        data: {
          nivel,
          origem,
          mensagem,
        },
      })
      console.log(`📝 [LOG-${nivel.toUpperCase()}] ${origem}: ${mensagem}`)
    } catch (error) {
      // Não falha a operação principal se o log falhar
      console.error("❌ Erro ao registrar log:", error)
    }
  }

  /**
   * Log de informação
   */
  static async info(origem: string, mensagem: string) {
    return this.log("info", origem, mensagem)
  }

  /**
   * Log de aviso
   */
  static async warn(origem: string, mensagem: string) {
    return this.log("warn", origem, mensagem)
  }

  /**
   * Log de erro
   */
  static async error(origem: string, mensagem: string) {
    return this.log("error", origem, mensagem)
  }

  /**
   * Log de cadastro de usuário
   */
  static async logUserRegistration(userId: number, userName: string, userType: string) {
    return this.info(
      "user_registration",
      `Novo usuário cadastrado: ID=${userId}, Nome="${userName}", Tipo=${userType}`,
    )
  }

  /**
   * Log de leitura RFID
   */
  static async logRFIDRead(cardId: string, totemId?: string) {
    return this.info("rfid_reader", `Cartão RFID lido: ${cardId}${totemId ? ` no totem ${totemId}` : ""}`)
  }

  /**
   * Log de vinculação de card
   */
  static async logCardBind(userId: number, cardId: string, success: boolean) {
    if (success) {
      return this.info("card_binding", `Cartão ${cardId} vinculado ao usuário ID=${userId} com sucesso`)
    } else {
      return this.warn("card_binding", `Falha ao vincular cartão ${cardId} ao usuário ID=${userId}`)
    }
  }

  /**
   * Log de acesso à sala (quando implementado)
   */
  static async logRoomAccess(userId: number, salaId: number, tipo: "entrada" | "saida") {
    return this.info(
      "room_access",
      `Usuário ID=${userId} registrou ${tipo} na sala ID=${salaId}`,
    )
  }

  /**
   * Log de erro no sistema
   */
  static async logSystemError(origem: string, errorMessage: string, details?: any) {
    const mensagem = details
      ? `${errorMessage} | Detalhes: ${JSON.stringify(details)}`
      : errorMessage
    return this.error(origem, mensagem)
  }

  /**
   * Busca logs recentes
   */
  static async getRecentLogs(limit = 100, nivel?: LogLevel) {
    try {
      const logs = await prisma.log_sistema.findMany({
        where: nivel ? { nivel } : undefined,
        orderBy: { criado_em: "desc" },
        take: limit,
      })
      return { success: true, data: logs }
    } catch (error) {
      console.error("❌ Erro ao buscar logs:", error)
      return { success: false, error: "Erro ao buscar logs" }
    }
  }

  /**
   * Busca logs por origem
   */
  static async getLogsByOrigem(origem: string, limit = 100) {
    try {
      const logs = await prisma.log_sistema.findMany({
        where: { origem },
        orderBy: { criado_em: "desc" },
        take: limit,
      })
      return { success: true, data: logs }
    } catch (error) {
      console.error("❌ Erro ao buscar logs:", error)
      return { success: false, error: "Erro ao buscar logs" }
    }
  }

  /**
   * Limpa logs antigos (opcional - manutenção)
   */
  static async cleanOldLogs(daysOld = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await prisma.log_sistema.deleteMany({
        where: {
          criado_em: {
            lt: cutoffDate,
          },
        },
      })

      console.log(`🧹 Limpeza de logs: ${result.count} registros removidos`)
      return { success: true, deleted: result.count }
    } catch (error) {
      console.error("❌ Erro ao limpar logs:", error)
      return { success: false, error: "Erro ao limpar logs" }
    }
  }
}

