/**
 * API Route: DELETE /api/registrations/[id]
 * Remove um usuário (usado quando vinculação de cartão falha)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LogService } from "@/lib/services/log.service"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Busca usuário antes de deletar (para log)
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        tag_uid: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Deleta usuário
    await prisma.usuario.delete({
      where: { id: userId },
    })

    // Registra log
    await LogService.warn(
      "user_management",
      `Usuário ${usuario.nome} (ID=${usuario.id}) removido - motivo: cartão já vinculado a outro usuário`
    )

    console.log(`🗑️ Usuário ${usuario.nome} (ID=${userId}) removido`)

    return NextResponse.json({
      success: true,
      message: "Usuário removido com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao deletar usuário:", error)
    await LogService.logSystemError("user_management", "Erro ao deletar usuário", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

