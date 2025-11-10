/**
 * API Route: PATCH /api/registrations/[id]/card
 * Endpoint para atualizar o card ID de um usuário
 */

import { NextRequest, NextResponse } from "next/server"
import { UsuarioService } from "@/lib/services/usuario.service"
import { z } from "zod"

const updateCardSchema = z.object({
  cardId: z.string().min(1, "Card ID é obrigatório").max(50, "Card ID muito longo"),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { cardId } = updateCardSchema.parse(body)

    const result = await UsuarioService.updateCardId(userId, cardId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

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

    console.error("Erro ao atualizar card ID:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

