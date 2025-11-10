/**
 * API Route: POST /api/rfid/bind
 * Vincula um card RFID ao usuário recém-cadastrado
 */

import { NextRequest, NextResponse } from "next/server"
import { UsuarioService } from "@/lib/services/usuario.service"
import { z } from "zod"

const bindCardSchema = z.object({
  userId: z.number().int().positive("userId deve ser um número positivo"),
  cardId: z.string().min(1, "cardId é obrigatório").max(50, "cardId muito longo"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, cardId } = bindCardSchema.parse(body)

    console.log(`🔗 Vinculando card ${cardId} ao usuário ${userId}`)

    // Atualiza o card ID do usuário
    const result = await UsuarioService.updateCardId(userId, cardId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    console.log(`✅ Card vinculado com sucesso:`, result.data)

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Cartão vinculado com sucesso",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    console.error("❌ Erro ao vincular card:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

