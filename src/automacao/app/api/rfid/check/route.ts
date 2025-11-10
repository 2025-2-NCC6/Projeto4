/**
 * API Route: POST /api/rfid/check
 * Verifica se um cardId já está vinculado e retorna informações
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const checkSchema = z.object({
  cardId: z.string().min(1).max(50),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId } = checkSchema.parse(body)

    // Busca usuário com este card
    const usuario = await prisma.usuario.findUnique({
      where: { tag_uid: cardId },
      select: {
        id: true,
        nome: true,
        tipo: true,
        ativo: true,
        criado_em: true,
      },
    })

    if (usuario) {
      return NextResponse.json({
        success: true,
        vinculado: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          tipo: usuario.tipo,
          ativo: usuario.ativo,
        },
        message: `Cartão já vinculado ao usuário: ${usuario.nome}`,
      })
    }

    return NextResponse.json({
      success: true,
      vinculado: false,
      message: "Cartão disponível para vinculação",
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

    console.error("❌ Erro ao verificar card:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

