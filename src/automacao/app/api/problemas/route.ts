import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Criar novo problema reportado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario_id, sala_id, tipo_problema, descricao } = body

    // Validações
    if (!usuario_id || !sala_id || !tipo_problema || !descricao) {
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

    // Criar problema reportado
    const novoProblema = await prisma.problema_reportado.create({
      data: {
        usuario_id,
        sala_id,
        tipo_problema,
        descricao,
        status: "pendente",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Problema reportado com sucesso",
      data: novoProblema,
    })
  } catch (error: any) {
    console.error("Erro ao reportar problema:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao reportar problema" },
      { status: 500 }
    )
  }
}

// Listar todos os problemas (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const salaId = searchParams.get("sala_id")

    const whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (salaId) {
      whereClause.sala_id = parseInt(salaId)
    }

    const problemas = await prisma.problema_reportado.findMany({
      where: whereClause,
      include: {
        sala: {
          select: {
            nome: true,
            predio: true,
          },
        },
        usuario: {
          select: {
            nome: true,
            email: true,
            tipo: true,
          },
        },
      },
      orderBy: {
        data_registro: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: problemas,
    })
  } catch (error: any) {
    console.error("Erro ao buscar problemas:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao buscar problemas" },
      { status: 500 }
    )
  }
}

