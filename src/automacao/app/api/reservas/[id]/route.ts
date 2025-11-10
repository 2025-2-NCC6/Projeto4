/**
 * API Route: /api/reservas/[id]
 * Gerenciamento de reserva específica
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Buscar reserva específica
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reservaId = parseInt(id, 10)

    if (isNaN(reservaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        sala: true,
        usuario: true,
      },
    })

    if (!reserva) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: reserva,
    })
  } catch (error) {
    console.error("❌ Erro ao buscar reserva:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Atualizar reserva
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reservaId = parseInt(id, 10)

    if (isNaN(reservaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const {
      sala_id,
      usuario_id,
      tipo,
      dia_semana,
      hora_inicio,
      hora_fim,
      data_inicio,
      data_fim,
      curso,
      disciplina,
      turma,
      categoria,
      observacao,
    } = body

    // Converter horários
    const hoje = new Date()
    const [horaInicioH, horaInicioM] = hora_inicio.split(":")
    const [horaFimH, horaFimM] = hora_fim.split(":")
    
    const horaInicioDate = new Date(hoje)
    horaInicioDate.setHours(parseInt(horaInicioH), parseInt(horaInicioM), 0, 0)
    
    const horaFimDate = new Date(hoje)
    horaFimDate.setHours(parseInt(horaFimH), parseInt(horaFimM), 0, 0)

    const reserva = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        sala_id: sala_id ? parseInt(sala_id) : undefined,
        usuario_id: usuario_id ? parseInt(usuario_id) : undefined,
        tipo,
        dia_semana: tipo === "fixa" ? dia_semana : null,
        hora_inicio: horaInicioDate,
        hora_fim: horaFimDate,
        data_inicio: data_inicio ? new Date(data_inicio) : null,
        data_fim: data_fim ? new Date(data_fim) : null,
        curso: curso || null,
        disciplina: disciplina || null,
        turma: turma || null,
        categoria,
        observacao: observacao || null,
      },
      include: {
        sala: true,
        usuario: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: reserva,
      message: "Reserva atualizada com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao atualizar reserva:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar reserva" },
      { status: 500 }
    )
  }
}

// DELETE - Excluir/Cancelar reserva
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reservaId = parseInt(id, 10)

    if (isNaN(reservaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Ao invés de deletar, marcar como cancelada
    const reserva = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        status: "cancelada",
      },
    })

    return NextResponse.json({
      success: true,
      data: reserva,
      message: "Reserva cancelada com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao cancelar reserva:", error)
    return NextResponse.json(
      { error: "Erro ao cancelar reserva" },
      { status: 500 }
    )
  }
}

// Função auxiliar para verificar conflitos
async function checkConflitos(params: {
  sala_id: number
  dia_semana?: string
  hora_inicio: string
  hora_fim: string
  data_inicio?: string
  data_fim?: string
  reserva_id?: number
}) {
  const conflitos: string[] = []

  const reservasExistentes = await prisma.reserva.findMany({
    where: {
      sala_id: params.sala_id,
      status: "ativa",
      ...(params.reserva_id && { id: { not: params.reserva_id } }),
    },
    include: {
      usuario: { select: { nome: true } },
    },
  })

  for (const reserva of reservasExistentes) {
    const horaInicioExistente = reserva.hora_inicio.toISOString().substring(11, 16)
    const horaFimExistente = reserva.hora_fim.toISOString().substring(11, 16)

    const horariosSobrepoe = (
      (params.hora_inicio >= horaInicioExistente && params.hora_inicio < horaFimExistente) ||
      (params.hora_fim > horaInicioExistente && params.hora_fim <= horaFimExistente) ||
      (params.hora_inicio <= horaInicioExistente && params.hora_fim >= horaFimExistente)
    )

    if (!horariosSobrepoe) continue

    if (reserva.tipo === "fixa" && params.dia_semana) {
      if (reserva.dia_semana === params.dia_semana) {
        conflitos.push(`Conflito com ${reserva.usuario.nome}`)
      }
    }
  }

  return conflitos
}

