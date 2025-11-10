/**
 * API Route: POST /api/registrations
 * Endpoint para criar novos registros de usuários
 */

import { NextRequest, NextResponse } from "next/server"
import { UsuarioService } from "@/lib/services/usuario.service"
import { registrationSchema } from "@/lib/validations/usuario"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação dos dados
    const validatedData = registrationSchema.parse(body)

    // Criar usuário
    const result = await UsuarioService.create(validatedData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: "Registro criado com sucesso",
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 422 },
      )
    }

    console.error("Erro na API de registrations:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    const cardId = searchParams.get("cardId")

    if (email) {
      const result = await UsuarioService.findByEmail(email)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, data: result.data })
    }

    if (cardId) {
      const result = await UsuarioService.findByCardId(cardId)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, data: result.data })
    }

    return NextResponse.json({ error: "Parâmetro email ou cardId é obrigatório" }, { status: 400 })
  } catch (error) {
    console.error("Erro na API de registrations GET:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

