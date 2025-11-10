/**
 * Validações e schemas para usuários
 * Inclui proteções contra SQL injection, XSS e validações robustas
 */

import { z } from "zod"
import validator from "validator"

// Sanitiza string removendo caracteres perigosos
export function sanitizeString(input: string): string {
  return validator.escape(validator.trim(input))
}

// Valida e sanitiza email
export function validateAndSanitizeEmail(email: string): string {
  const trimmed = validator.trim(email)
  const normalized = validator.normalizeEmail(trimmed, {
    all_lowercase: true,
    gmail_remove_dots: false,
  }) || trimmed
  
  if (!validator.isEmail(normalized)) {
    throw new Error("Email inválido")
  }
  
  // Previne emails muito longos (DoS)
  if (normalized.length > 120) {
    throw new Error("Email muito longo")
  }
  
  return normalized
}

// Schema de validação principal
export const registrationSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo")
    .refine(
      (val) => {
        // Remove espaços e verifica se tem conteúdo
        const trimmed = val.trim()
        return trimmed.length >= 3
      },
      { message: "Nome deve conter pelo menos 3 caracteres válidos" }
    )
    .refine(
      (val) => {
        // Aceita apenas letras, espaços, acentos e hífens
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(val)
      },
      { message: "Nome contém caracteres inválidos" }
    )
    .transform(sanitizeString),
    
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .transform((val) => {
      return validateAndSanitizeEmail(val)
    }),
    
  type: z.enum(["professor", "tecnico", "aluno", "visitante"], {
    errorMap: () => ({ message: "Tipo de usuário inválido" }),
  }),
  
  cardId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val.trim() === "") return null
      const trimmed = validator.trim(val)
      
      // Previne IDs muito longos
      if (trimmed.length > 50) {
        throw new Error("ID do cartão muito longo")
      }
      
      // Permite apenas alfanuméricos, dois pontos e hífens (formato comum de RFID)
      if (!/^[A-Fa-f0-9:_-]+$/.test(trimmed)) {
        throw new Error("ID do cartão contém caracteres inválidos")
      }
      
      return trimmed.toUpperCase()
    }),
})

// Schema apenas para validação de email (usado no frontend)
export const emailValidationSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .refine(
      (val) => validator.isEmail(val),
      { message: "Email inválido" }
    )
    .transform((val) => validateAndSanitizeEmail(val)),
})

export type RegistrationInput = z.infer<typeof registrationSchema>
export type EmailValidation = z.infer<typeof emailValidationSchema>

