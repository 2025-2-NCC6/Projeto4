/**
 * API Route: /api/salas/[id]
 * Gerenciamento de sala específica
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Buscar sala específica
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const salaId = parseInt(id, 10)

    if (isNaN(salaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const sala = await prisma.sala.findUnique({
      where: { id: salaId },
      include: {
        equipamento: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            identificador: true,
            status: true,
          },
        },
      },
    })

    if (!sala) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 })
    }

    // Formatar para o frontend
    const salaFormatada = {
      id: sala.id,
      nome: sala.nome,
      tipo: sala.tipo,
      predio: sala.predio,
      ativo: sala.status === "ativa",
      capacidade: sala.capacidade,
      andar: sala.andar,
      area_m2: sala.area_m2,
      patrocinada: sala.patrocinada,
      empresa_patrocinadora: sala.empresa_patrocinadora,
      observacoes: sala.observacoes,
      equipamentos: sala.equipamento.map((eq) => ({
        id: eq.id,
        tipo: eq.tipo,
        nome: eq.nome,
        status: eq.status || "ativo",
        identificador: eq.identificador,
      })),
    }

    return NextResponse.json({
      success: true,
      data: salaFormatada,
    })
  } catch (error) {
    console.error("❌ Erro ao buscar sala:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Atualizar sala
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const salaId = parseInt(id, 10)

    if (isNaN(salaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const {
      nome,
      tipo,
      predio,
      capacidade,
      andar,
      area_m2,
      patrocinada,
      empresa_patrocinadora,
      observacoes,
      ativo,
      equipamentos,
    } = body

    // Atualizar sala e equipamentos
    const sala = await prisma.sala.update({
      where: { id: salaId },
      data: {
        nome,
        tipo,
        predio,
        capacidade: capacidade ? parseInt(capacidade) : null,
        andar: andar ? parseInt(andar) : null,
        area_m2: area_m2 ? parseFloat(area_m2) : null,
        patrocinada: patrocinada || false,
        empresa_patrocinadora: patrocinada ? empresa_patrocinadora : null,
        observacoes: observacoes || null,
        status: ativo ? "ativa" : "inativa",
      },
    })

    // Gerenciar equipamentos
    if (equipamentos !== undefined) {
      // 1. Buscar equipamentos existentes da sala
      const equipamentosExistentes = await prisma.equipamento.findMany({
        where: { sala_id: salaId },
        select: { id: true },
      })

      const equipamentosIds = equipamentosExistentes.map(eq => eq.id)

      // 2. Deletar leituras de sensores relacionadas aos equipamentos (para evitar constraint violation)
      if (equipamentosIds.length > 0) {
        await prisma.leitura_sensor.deleteMany({
          where: {
            equipamento_id: {
              in: equipamentosIds,
            },
          },
        })
        console.log(`🗑️ Deletadas leituras de ${equipamentosIds.length} equipamento(s)`)
      }

      // 3. Deletar ações de equipamento relacionadas (se houver)
      if (equipamentosIds.length > 0) {
        await prisma.acao_equipamento.deleteMany({
          where: {
            equipamento_id: {
              in: equipamentosIds,
            },
          },
        })
      }

      // 4. Agora podemos deletar os equipamentos
      await prisma.equipamento.deleteMany({
        where: { sala_id: salaId },
      })

      // 5. Criar novos equipamentos
      if (equipamentos.length > 0) {
        await prisma.equipamento.createMany({
          data: equipamentos.map((eq: any) => ({
            sala_id: salaId,
            nome: eq.nome,
            tipo: eq.tipo,
            identificador: eq.identificador,
            relay_id: eq.relay_id ? parseInt(eq.relay_id) : null,
            status: eq.status || "ativo",
            ativo: true,
          })),
        })
      }
    }

    // Buscar sala atualizada com equipamentos
    const salaAtualizada = await prisma.sala.findUnique({
      where: { id: salaId },
      include: {
        equipamento: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: salaAtualizada,
      message: "Sala atualizada com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao atualizar sala:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar sala" },
      { status: 500 }
    )
  }
}

// DELETE - Excluir sala
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const salaId = parseInt(id, 10)

    if (isNaN(salaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Verificar se a sala existe
    const sala = await prisma.sala.findUnique({
      where: { id: salaId },
    })

    if (!sala) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 })
    }

    // Excluir sala (equipamentos serão excluídos automaticamente devido ao onDelete: Cascade)
    await prisma.sala.delete({
      where: { id: salaId },
    })

    return NextResponse.json({
      success: true,
      message: "Sala excluída com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao excluir sala:", error)
    return NextResponse.json(
      { error: "Erro ao excluir sala" },
      { status: 500 }
    )
  }
}

// PATCH - Ativar/Desativar sala
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const salaId = parseInt(id, 10)

    if (isNaN(salaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { ativo } = body

    const sala = await prisma.sala.update({
      where: { id: salaId },
      data: {
        status: ativo ? "ativa" : "inativa",
      },
    })

    return NextResponse.json({
      success: true,
      data: sala,
      message: `Sala ${ativo ? "ativada" : "desativada"} com sucesso`,
    })
  } catch (error) {
    console.error("❌ Erro ao alterar status da sala:", error)
    return NextResponse.json(
      { error: "Erro ao alterar status da sala" },
      { status: 500 }
    )
  }
}
