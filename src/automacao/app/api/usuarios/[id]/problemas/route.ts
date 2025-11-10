import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuarioId = parseInt(params.id)

    if (isNaN(usuarioId)) {
      return NextResponse.json(
        { success: false, error: "ID de usuário inválido" },
        { status: 400 }
      )
    }

    // Buscar problemas reportados pelo usuário
    const problemas = await prisma.problema_reportado.findMany({
      where: {
        usuario_id: usuarioId,
      },
      include: {
        sala: {
          select: {
            nome: true,
            predio: true,
          },
        },
      },
      orderBy: {
        data_registro: "desc",
      },
    })

    // Formatar resposta
    const problemasFormatados = problemas.map((problema) => ({
      id: problema.id,
      sala_nome: problema.sala.nome,
      predio: problema.sala.predio,
      tipo_problema: problema.tipo_problema,
      descricao: problema.descricao,
      status: problema.status,
      data_registro: problema.data_registro,
      data_resolucao: problema.data_resolucao,
      observacoes_adm: problema.observacoes_adm,
    }))

    return NextResponse.json({
      success: true,
      data: problemasFormatados,
    })
  } catch (error: any) {
    console.error("Erro ao buscar problemas do usuário:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao buscar problemas" },
      { status: 500 }
    )
  }
}

