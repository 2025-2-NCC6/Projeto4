/**
 * API Route: /api/usuarios/[id]
 * Gerenciamento de usuário específico
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Buscar usuário específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const usuarioId = parseInt(id, 10)

    if (isNaN(usuarioId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        acesso_sala: {
          orderBy: {
            timestamp: "desc",
          },
          take: 10,
          include: {
            sala: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: usuario,
    })
  } catch (error) {
    console.error("❌ Erro ao buscar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const usuarioId = parseInt(id, 10)

    if (isNaN(usuarioId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { nome, email, tipo, tag_uid, ativo } = body

    // Verificar se o email já está em uso por outro usuário
    if (email) {
      const emailExiste = await prisma.usuario.findFirst({
        where: {
          email,
          id: { not: usuarioId },
        },
      })

      if (emailExiste) {
        return NextResponse.json(
          { error: "Email já cadastrado em outro usuário" },
          { status: 409 }
        )
      }
    }

    // Verificar se o RFID já está em uso por outro usuário
    if (tag_uid) {
      const rfidExiste = await prisma.usuario.findFirst({
        where: {
          tag_uid,
          id: { not: usuarioId },
        },
      })

      if (rfidExiste) {
        return NextResponse.json(
          { error: "Cartão RFID já cadastrado em outro usuário" },
          { status: 409 }
        )
      }
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nome: nome || undefined,
        email: email || null,
        tipo: tipo || undefined,
        tag_uid: tag_uid || null,
        ativo: ativo !== undefined ? ativo : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      data: usuario,
      message: "Usuário atualizado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}

// DELETE - Excluir usuário permanentemente
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const usuarioId = parseInt(id, 10)

    if (isNaN(usuarioId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se tem reservas ativas
    const reservasAtivas = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count FROM reserva 
      WHERE usuario_id = ${usuarioId} AND status = 'ativa'
    `
    
    const totalReservasAtivas = Number(reservasAtivas[0]?.count || 0)

    if (totalReservasAtivas > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir. O usuário possui ${totalReservasAtivas} reserva(s) ativa(s). Cancele as reservas antes de excluir.`,
        },
        { status: 409 }
      )
    }

    // Excluir registros relacionados primeiro (em ordem de dependência)
    // Usando transaction para garantir atomicidade
    
    await prisma.$transaction(async (tx) => {
      // 1. Excluir acessos à sala
      await tx.acesso_sala.deleteMany({
        where: { usuario_id: usuarioId },
      })

      // 2. Excluir solicitações de reserva (criadas pelo usuário)
      await tx.$executeRaw`
        DELETE FROM solicitacao_reserva WHERE usuario_id = ${usuarioId}
      `

      // 3. Atualizar solicitações aprovadas pelo usuário (remover vínculo)
      await tx.$executeRaw`
        UPDATE solicitacao_reserva SET aprovado_por = NULL WHERE aprovado_por = ${usuarioId}
      `

      // 4. Excluir reservas (mesmo que canceladas)
      await tx.$executeRaw`
        DELETE FROM reserva WHERE usuario_id = ${usuarioId}
      `

      // 5. Finalmente, excluir o usuário
      await tx.usuario.delete({
        where: { id: usuarioId },
      })
    })

    return NextResponse.json({
      success: true,
      message: "Usuário excluído com sucesso",
    })
  } catch (error: any) {
    console.error("❌ Erro ao excluir usuário:", error)
    
    // Verificar se é erro de foreign key
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Não é possível excluir. O usuário possui registros vinculados no sistema." },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 }
    )
  }
}

// PATCH - Ativar/Desativar usuário
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const usuarioId = parseInt(id, 10)

    if (isNaN(usuarioId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { ativo } = body

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ativo,
      },
    })

    return NextResponse.json({
      success: true,
      data: usuario,
      message: `Usuário ${ativo ? "ativado" : "desativado"} com sucesso`,
    })
  } catch (error) {
    console.error("❌ Erro ao alterar status do usuário:", error)
    return NextResponse.json(
      { error: "Erro ao alterar status do usuário" },
      { status: 500 }
    )
  }
}

