import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      usuario_id,
      sala_id,
      tipo_reserva,
      data,
      horario_inicio,
      horario_fim,
      finalidade,
      observacoes,
      disciplina,
      turma,
      periodo_academico,
    } = body

    // Validações
    if (!usuario_id || !sala_id || !tipo_reserva || !data || !horario_inicio || !horario_fim) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    // Verificar se a sala existe
    const sala = await prisma.sala.findUnique({
      where: { id: sala_id },
    })

    if (!sala) {
      return NextResponse.json(
        { success: false, error: "Sala não encontrada" },
        { status: 404 }
      )
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id },
    })

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Se for professor, criar reserva diretamente (aprovação automática)
    // Se for aluno, criar solicitação de reserva que precisa de aprovação
    if (usuario.tipo === "professor") {
      // Professor: criar reserva diretamente
      const novaReserva = await prisma.reserva.create({
        data: {
          sala_id,
          usuario_id,
          tipo: tipo_reserva,
          data: new Date(data),
          horario_inicio,
          horario_fim,
          disciplina: disciplina || null,
          turma: turma || null,
          periodo_academico: periodo_academico || null,
          categoria: "aula", // Padrão
          status: "ativa",
        },
      })

      return NextResponse.json({
        success: true,
        message: "Reserva criada com sucesso",
        data: novaReserva,
        aprovacao_automatica: true,
      })
    } else {
      // Aluno: criar solicitação de reserva
      const novaSolicitacao = await prisma.solicitacao_reserva.create({
        data: {
          sala_id,
          usuario_id,
          tipo: tipo_reserva,
          data_solicitada: new Date(data),
          horario_inicio,
          horario_fim,
          finalidade: finalidade || null,
          observacoes: observacoes || null,
          status: "pendente",
        },
      })

      return NextResponse.json({
        success: true,
        message: "Solicitação enviada para aprovação",
        data: novaSolicitacao,
        aprovacao_automatica: false,
      })
    }
  } catch (error: any) {
    console.error("Erro ao criar solicitação de reserva:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao processar solicitação" },
      { status: 500 }
    )
  }
}

