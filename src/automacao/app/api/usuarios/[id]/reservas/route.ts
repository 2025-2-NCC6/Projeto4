import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    
    const usuarioId = parseInt(params.id)

    if (isNaN(usuarioId)) {
      return NextResponse.json(
        { success: false, error: "ID de usuário inválido" },
        { status: 400 }
      )
    }

    // Buscar reservas do usuário
    const whereClause: any = {
      usuario_id: usuarioId,
    }

    if (status) {
      if (status === "ativa") {
        whereClause.status = { in: ["ativa", "confirmada"] }
      } else {
        whereClause.status = status
      }
    }

    const reservas = await prisma.reserva.findMany({
      where: whereClause,
      include: {
        sala: {
          include: {
            equipamento: {
              where: { ativo: true },
              select: {
                id: true,
                tipo: true,
                relay_id: true,
              },
            },
          },
        },
      },
      orderBy: [
        { data: "asc" },
        { horario_inicio: "asc" },
      ],
    })

    // Formatar resposta
    const reservasFormatadas = reservas.map((reserva) => ({
      id: reserva.id,
      sala_id: reserva.sala_id,
      sala_nome: reserva.sala.nome,
      predio: reserva.sala.predio,
      data: reserva.data,
      horario_inicio: reserva.horario_inicio,
      horario_fim: reserva.horario_fim,
      status: reserva.status,
      tipo_reserva: reserva.tipo,
      equipamentos: reserva.sala.equipamento.map((eq: any) => ({
        id: eq.id,
        tipo: eq.tipo,
        relay_id: eq.relay_id,
      })),
      ar_condicionado_ligado: false, // TODO: Implementar verificação de estado real
      temperatura_atual: null, // TODO: Buscar de leitura_sensor
    }))

    return NextResponse.json({
      success: true,
      data: reservasFormatadas,
    })
  } catch (error: any) {
    console.error("Erro ao buscar reservas do usuário:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao buscar reservas" },
      { status: 500 }
    )
  }
}

