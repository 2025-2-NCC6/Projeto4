/**
 * API Route: POST /api/admin/cards/unbind
 * Remove vinculação de um cartão (apenas para admin/manutenção)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LogService } from "@/lib/services/log.service"
import { z } from "zod"

const unbindSchema = z.object({
  cardId: z.string().min(1).max(50),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId } = unbindSchema.parse(body)

    // Busca usuário com este card
    const usuario = await prisma.usuario.findUnique({
      where: { tag_uid: cardId },
      select: {
        id: true,
        nome: true,
        tag_uid: true,
      },
    })

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum usuário encontrado com este cartão",
        },
        { status: 404 }
      )
    }

    // Remove vinculação
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tag_uid: null },
    })

    // Log da operação
    await LogService.warn(
      "card_management",
      `Cartão ${cardId} desvinculado do usuário ${usuario.nome} (ID=${usuario.id}) via API admin`
    )

    console.log(`🔓 Cartão ${cardId} desvinculado do usuário ${usuario.nome}`)

    return NextResponse.json({
      success: true,
      message: `Cartão desvinculado com sucesso`,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors,
        },
        { status: 422 }
      )
    }

    console.error("❌ Erro ao desvincular card:", error)
    await LogService.logSystemError("card_management", "Erro ao desvincular cartão", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

