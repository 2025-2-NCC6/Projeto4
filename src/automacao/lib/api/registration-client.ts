/**
 * Client-side API functions para registrations
 * Funções para consumir a API de registros do lado do cliente
 */

import { RegistrationInput } from "@/lib/validations/usuario"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: Array<{ field: string; message: string }>
}

// Interface para criação de registro (email obrigatório)
export interface CreateRegistrationInput {
  name: string
  email: string // Obrigatório
  type: "professor" | "tecnico" | "aluno" | "visitante"
  cardId?: string | null
}

/**
 * Cria um novo registro de usuário
 */
export async function createRegistration(data: CreateRegistrationInput): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Erro ao criar registro",
        details: result.details,
      }
    }

    return result
  } catch (error) {
    console.error("Erro ao criar registro:", error)
    return {
      success: false,
      error: "Erro de conexão. Verifique sua internet e tente novamente.",
    }
  }
}

/**
 * Busca um usuário por email
 */
export async function findUserByEmail(email: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/registrations?email=${encodeURIComponent(email)}`)
    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return result
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return { success: false, error: "Erro de conexão" }
  }
}

/**
 * Busca um usuário por card ID
 */
export async function findUserByCardId(cardId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/registrations?cardId=${encodeURIComponent(cardId)}`)
    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return result
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return { success: false, error: "Erro de conexão" }
  }
}

/**
 * Atualiza o card ID de um usuário
 */
export async function updateUserCardId(userId: number, cardId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/registrations/${userId}/card`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cardId }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return result
  } catch (error) {
    console.error("Erro ao atualizar card ID:", error)
    return { success: false, error: "Erro de conexão" }
  }
}

