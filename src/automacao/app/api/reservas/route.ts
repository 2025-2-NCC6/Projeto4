/**
 * API Route: /api/reservas
 * Gerenciamento de reservas
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Lista todas as reservas
export async function GET() {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        sala: {
          select: {
            id: true,
            nome: true,
            predio: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: [
        { dia_semana: "asc" },
        { hora_inicio: "asc" },
      ],
    })

    // Formatar para o frontend
    const reservasFormatadas = reservas.map((reserva) => ({
      id: reserva.id,
      sala_id: reserva.sala_id,
      sala_nome: reserva.sala.nome,
      predio: reserva.sala.predio,
      usuario_id: reserva.usuario_id,
      professor: reserva.usuario.nome,
      tipo: reserva.tipo,
      dia_semana: reserva.dia_semana,
      hora_inicio: reserva.hora_inicio.toISOString().substring(11, 16), // HH:mm
      hora_fim: reserva.hora_fim.toISOString().substring(11, 16),
      data_inicio: reserva.data_inicio?.toISOString().split('T')[0],
      data_fim: reserva.data_fim?.toISOString().split('T')[0],
      curso: reserva.curso,
      disciplina: reserva.disciplina,
      turma: reserva.turma,
      categoria: reserva.categoria,
      status: reserva.status,
      observacao: reserva.observacao,
    }))

    return NextResponse.json({
      success: true,
      data: reservasFormatadas,
      count: reservasFormatadas.length,
    })
  } catch (error) {
    console.error("❌ Erro ao listar reservas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Criar nova reserva
export async function POST(request: Request) {
  try {
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

    // Validações básicas
    if (!sala_id || !usuario_id || !tipo || !hora_inicio || !hora_fim || !categoria) {
      return NextResponse.json(
        { error: "Campos obrigatórios: sala_id, usuario_id, tipo, hora_inicio, hora_fim, categoria" },
        { status: 400 }
      )
    }

    // Validação específica por tipo
    if (tipo === "fixa" && !dia_semana) {
      return NextResponse.json(
        { error: "Reservas fixas requerem dia_semana" },
        { status: 400 }
      )
    }

    if ((tipo === "temporaria" || tipo === "evento") && !data_inicio) {
      return NextResponse.json(
        { error: "Reservas temporárias e eventos requerem data_inicio" },
        { status: 400 }
      )
    }

    // Verificar conflitos antes de criar
    const conflitos = await checkConflitos({
      sala_id: parseInt(sala_id),
      dia_semana,
      hora_inicio,
      hora_fim,
      data_inicio,
      data_fim,
    })

    if (conflitos.length > 0) {
      return NextResponse.json(
        { error: "Conflito de horário detectado", conflitos },
        { status: 409 }
      )
    }

    // Converter horários para Date objects
    const hoje = new Date()
    const [horaInicioH, horaInicioM] = hora_inicio.split(":")
    const [horaFimH, horaFimM] = hora_fim.split(":")
    
    const horaInicioDate = new Date(hoje)
    horaInicioDate.setHours(parseInt(horaInicioH), parseInt(horaInicioM), 0, 0)
    
    const horaFimDate = new Date(hoje)
    horaFimDate.setHours(parseInt(horaFimH), parseInt(horaFimM), 0, 0)

    // Criar reserva
    const reserva = await prisma.reserva.create({
      data: {
        sala_id: parseInt(sala_id),
        usuario_id: parseInt(usuario_id),
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
        status: "ativa",
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
      message: "Reserva criada com sucesso",
    }, { status: 201 })
  } catch (error) {
    console.error("❌ Erro ao criar reserva:", error)
    return NextResponse.json(
      { error: "Erro ao criar reserva" },
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
  reserva_id_excluir?: number
}) {
  const conflitos: string[] = []

  // Buscar reservas da mesma sala
  const reservasExistentes = await prisma.reserva.findMany({
    where: {
      sala_id: params.sala_id,
      status: "ativa",
      ...(params.reserva_id_excluir && { id: { not: params.reserva_id_excluir } }),
    },
    include: {
      usuario: { select: { nome: true } },
    },
  })

  for (const reserva of reservasExistentes) {
    // Converter para strings de hora para comparação
    const horaInicioExistente = reserva.hora_inicio.toISOString().substring(11, 16)
    const horaFimExistente = reserva.hora_fim.toISOString().substring(11, 16)

    // Verificar se há sobreposição de horários
    const horariosSobrepoe = (
      (params.hora_inicio >= horaInicioExistente && params.hora_inicio < horaFimExistente) ||
      (params.hora_fim > horaInicioExistente && params.hora_fim <= horaFimExistente) ||
      (params.hora_inicio <= horaInicioExistente && params.hora_fim >= horaFimExistente)
    )

    if (!horariosSobrepoe) continue

    // Para reservas fixas, verificar mesmo dia da semana
    if (reserva.tipo === "fixa" && params.dia_semana) {
      if (reserva.dia_semana === params.dia_semana) {
        conflitos.push(
          `Conflito com reserva fixa de ${reserva.usuario.nome} às ${horaInicioExistente}-${horaFimExistente}`
        )
      }
    }

    // Para reservas temporárias/eventos, verificar overlap de datas
    if (reserva.tipo !== "fixa" && params.data_inicio) {
      // Lógica de overlap de datas (simplificada)
      conflitos.push(
        `Conflito com ${reserva.tipo} de ${reserva.usuario.nome}`
      )
    }
  }

  return conflitos
}

