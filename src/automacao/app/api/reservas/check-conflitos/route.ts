/**
 * API Route: /api/reservas/check-conflitos
 * Verifica conflitos de horário
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sala_id = searchParams.get("sala_id")
    const dia_semana = searchParams.get("dia_semana")
    const hora_inicio = searchParams.get("hora_inicio")
    const hora_fim = searchParams.get("hora_fim")
    const data_inicio = searchParams.get("data_inicio")
    const reserva_id = searchParams.get("reserva_id")

    if (!sala_id || !hora_inicio || !hora_fim) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: sala_id, hora_inicio, hora_fim" },
        { status: 400 }
      )
    }

    const conflitos: string[] = []

    // Buscar reservas da mesma sala
    const reservasExistentes = await prisma.reserva.findMany({
      where: {
        sala_id: parseInt(sala_id),
        status: "ativa",
        ...(reserva_id && { id: { not: parseInt(reserva_id) } }),
      },
      include: {
        usuario: { select: { nome: true } },
        sala: { select: { nome: true } },
      },
    })

    for (const reserva of reservasExistentes) {
      const horaInicioExistente = reserva.hora_inicio.toISOString().substring(11, 16)
      const horaFimExistente = reserva.hora_fim.toISOString().substring(11, 16)

      // Verificar sobreposição de horários
      const horariosSobrepoe = (
        (hora_inicio >= horaInicioExistente && hora_inicio < horaFimExistente) ||
        (hora_fim > horaInicioExistente && hora_fim <= horaFimExistente) ||
        (hora_inicio <= horaInicioExistente && hora_fim >= horaFimExistente)
      )

      if (!horariosSobrepoe) continue

      // Para reservas fixas, verificar mesmo dia da semana
      if (reserva.tipo === "fixa" && dia_semana) {
        if (reserva.dia_semana === dia_semana) {
          conflitos.push(
            `${reserva.sala.nome} - ${reserva.usuario.nome} - ${horaInicioExistente} às ${horaFimExistente}${reserva.disciplina ? ` (${reserva.disciplina})` : ""}`
          )
        }
      }

      // Para eventos/temporárias com data
      if (reserva.tipo !== "fixa" && data_inicio) {
        const dataInicioReq = new Date(data_inicio)
        if (reserva.data_inicio && reserva.data_inicio.toISOString().split('T')[0] === data_inicio) {
          conflitos.push(
            `${reserva.sala.nome} - ${reserva.usuario.nome} - ${horaInicioExistente} às ${horaFimExistente}`
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      conflitos,
      has_conflitos: conflitos.length > 0,
    })
  } catch (error) {
    console.error("❌ Erro ao verificar conflitos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

