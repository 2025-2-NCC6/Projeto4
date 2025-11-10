/**
 * API Route: /api/usuarios
 * Gerenciamento de usuários
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Lista usuários (com filtro por tipo)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get("tipo")
    const busca = searchParams.get("busca")

    const usuarios = await prisma.usuario.findMany({
      where: {
        ...(tipo && tipo !== "all" && { tipo: tipo as any }),
        ...(busca && {
          OR: [
            { nome: { contains: busca } },
            { email: { contains: busca } },
            { tag_uid: { contains: busca } },
          ],
        }),
      },
      include: {
        acesso_sala: {
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
          select: {
            timestamp: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    })

    // Formatar para o frontend
    const usuariosFormatados = usuarios.map((usuario) => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      tag_uid: usuario.tag_uid,
      ativo: usuario.ativo,
      criado_em: usuario.criado_em,
      ultimo_acesso: usuario.acesso_sala[0]?.timestamp || null,
    }))

    return NextResponse.json({
      success: true,
      data: usuariosFormatados,
      count: usuariosFormatados.length,
    })
  } catch (error) {
    console.error("❌ Erro ao listar usuários:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Criar novo usuário
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, tipo, tag_uid } = body

    // Validações básicas
    if (!nome || !tipo) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, tipo" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    if (email) {
      const emailExiste = await prisma.usuario.findFirst({
        where: { email },
      })

      if (emailExiste) {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 409 }
        )
      }
    }

    // Verificar se o RFID já existe
    if (tag_uid) {
      const rfidExiste = await prisma.usuario.findFirst({
        where: { tag_uid },
      })

      if (rfidExiste) {
        return NextResponse.json(
          { error: "Cartão RFID já cadastrado" },
          { status: 409 }
        )
      }
    }

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email: email || null,
        tipo,
        tag_uid: tag_uid || null,
        ativo: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: usuario,
      message: "Usuário criado com sucesso",
    }, { status: 201 })
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}

