/**
 * Serviço de usuários
 * Camada de lógica de negócio para operações com usuários
 */

import { prisma } from "@/lib/prisma"
import { RegistrationInput } from "@/lib/validations/usuario"
import { Prisma } from "@prisma/client"
import { LogService } from "./log.service"
import { EmailService } from "./email.service"

export class UsuarioService {
  /**
   * Cria um novo usuário (registro)
   */
  static async create(data: RegistrationInput) {
    try {
      // Validação extra: verifica se email já existe (email é obrigatório)
      const existingByEmail = await prisma.usuario.findFirst({
        where: { email: data.email },
      })
      if (existingByEmail) {
        await LogService.warn("user_registration", `Tentativa de cadastro com email duplicado: ${data.email}`)
        // Mensagem genérica por segurança (não revela se email existe)
        return { success: false, error: "Não foi possível completar o cadastro. Verifique os dados informados." }
      }

      // Validação extra: verifica se card já existe
      if (data.cardId) {
        const existingByCard = await prisma.usuario.findUnique({
          where: { tag_uid: data.cardId },
        })
        if (existingByCard) {
          await LogService.error("user_registration", `Tentativa de cadastro com card duplicado: ${data.cardId}`)
          return { success: false, error: "Este cartão já está vinculado a outro usuário" }
        }
      }

      const usuario = await prisma.usuario.create({
        data: {
          nome: data.name,
          email: data.email, // Email é obrigatório
          tipo: data.type as "professor" | "tecnico" | "aluno" | "visitante",
          tag_uid: data.cardId || null,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          tag_uid: true,
          criado_em: true,
        },
      })

      // Registra log do cadastro
      await LogService.logUserRegistration(usuario.id, usuario.nome, usuario.tipo || "")

      // Envia email de confirmação (email é obrigatório)
      EmailService.sendRegistrationConfirmation(
        usuario.email!,
        usuario.nome,
        usuario.tipo || "visitante"
      ).catch((error) => {
        console.error("Erro ao enviar email de confirmação:", error)
        // Não falha o cadastro se o email falhar
      })

      return { success: true, data: usuario }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint violation
        if (error.code === "P2002") {
          const field = (error.meta?.target as string[])?.[0]
          if (field === "email") {
            await LogService.error("user_registration", `Tentativa de cadastro com email duplicado: ${data.email}`)
            return { success: false, error: "Este email já está cadastrado" }
          }
          if (field === "tag_uid") {
            await LogService.error("user_registration", `Tentativa de cadastro com card duplicado: ${data.cardId}`)
            return { success: false, error: "Este cartão já está vinculado a outro usuário" }
          }
          return { success: false, error: "Registro duplicado" }
        }
      }
      console.error("Erro ao criar usuário:", error)
      await LogService.logSystemError("user_registration", "Erro ao criar usuário", error)
      return { success: false, error: "Erro ao criar registro" }
    }
  }

  /**
   * Busca usuário por email
   */
  static async findByEmail(email: string) {
    try {
      const usuario = await prisma.usuario.findFirst({
        where: { email },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          tag_uid: true,
          ativo: true,
        },
      })

      return { success: true, data: usuario }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return { success: false, error: "Erro ao buscar usuário" }
    }
  }

  /**
   * Busca usuário por tag/card ID
   */
  static async findByCardId(tagUid: string) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { tag_uid: tagUid },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          tag_uid: true,
          ativo: true,
        },
      })

      return { success: true, data: usuario }
    } catch (error) {
      console.error("Erro ao buscar usuário por card:", error)
      return { success: false, error: "Erro ao buscar usuário" }
    }
  }

  /**
   * Atualiza tag_uid de um usuário existente
   */
  static async updateCardId(userId: number, tagUid: string) {
    try {
      // Verifica se cartão já está vinculado a OUTRO usuário
      const existingCard = await prisma.usuario.findUnique({
        where: { tag_uid: tagUid },
        select: { id: true, nome: true },
      })

      if (existingCard && existingCard.id !== userId) {
        await LogService.logCardBind(userId, tagUid, false)
        await LogService.warn(
          "card_binding",
          `Tentativa de vincular card ${tagUid} ao usuário ID=${userId}, mas já está vinculado ao usuário ${existingCard.nome} (ID=${existingCard.id})`
        )
        return { 
          success: false, 
          error: "Este cartão já está vinculado a outro usuário",
          shouldDeleteUser: true, // Flag para frontend deletar o usuário
        }
      }

      const usuario = await prisma.usuario.update({
        where: { id: userId },
        data: { tag_uid: tagUid },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          tag_uid: true,
        },
      })

      // Registra log da vinculação
      await LogService.logCardBind(usuario.id, tagUid, true)

      return { success: true, data: usuario }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          await LogService.logCardBind(userId, tagUid, false)
          await LogService.warn("card_binding", `Card ${tagUid} já vinculado a outro usuário`)
          return { 
            success: false, 
            error: "Este cartão já está vinculado a outro usuário",
            shouldDeleteUser: true,
          }
        }
      }
      console.error("Erro ao atualizar card ID:", error)
      await LogService.logSystemError("card_binding", "Erro ao atualizar card ID", error)
      return { success: false, error: "Erro ao atualizar cartão" }
    }
  }

  /**
   * Remove um usuário (usado quando cadastro falha)
   */
  static async delete(userId: number) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
      })

      if (!usuario) {
        return { success: false, error: "Usuário não encontrado" }
      }

      await prisma.usuario.delete({
        where: { id: userId },
      })

      await LogService.warn(
        "user_management",
        `Usuário ${usuario.nome} (ID=${userId}) removido - cadastro incompleto`
      )

      return { success: true }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error)
      await LogService.logSystemError("user_management", "Erro ao deletar usuário", error)
      return { success: false, error: "Erro ao deletar usuário" }
    }
  }
}

