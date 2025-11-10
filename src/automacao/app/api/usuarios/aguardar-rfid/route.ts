/**
 * API Route: /api/usuarios/aguardar-rfid
 * Aguarda leitura de cartão RFID para cadastro
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Aguardar leitura de RFID (polling)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeout = parseInt(searchParams.get("timeout") || "10000") // 10 segundos padrão

    const startTime = Date.now()
    const maxTime = timeout

    // Polling - verificar se há uma tag lida recentemente
    while (Date.now() - startTime < maxTime) {
      // Buscar último acesso sem usuário (tag não cadastrada)
      const ultimoAcesso = await prisma.acesso_sala.findFirst({
        where: {
          usuario: {
            tag_uid: {
              not: null,
            },
          },
        },
        orderBy: {
          timestamp: "desc",
        },
        include: {
          usuario: {
            select: {
              tag_uid: true,
            },
          },
        },
      })

      // Verificar se há uma leitura recente (últimos 5 segundos)
      if (ultimoAcesso && ultimoAcesso.timestamp) {
        const diffMs = Date.now() - new Date(ultimoAcesso.timestamp).getTime()
        
        if (diffMs < 5000) { // 5 segundos
          // Verificar se a tag já está cadastrada
          const tagJaCadastrada = await prisma.usuario.findFirst({
            where: {
              tag_uid: ultimoAcesso.usuario.tag_uid,
            },
          })

          if (!tagJaCadastrada && ultimoAcesso.usuario.tag_uid) {
            return NextResponse.json({
              success: true,
              tag_uid: ultimoAcesso.usuario.tag_uid,
              message: "Tag RFID detectada",
            })
          }
        }
      }

      // Aguardar 500ms antes de verificar novamente
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Timeout atingido
    return NextResponse.json({
      success: false,
      message: "Timeout: nenhuma tag detectada",
    }, { status: 408 })
  } catch (error) {
    console.error("❌ Erro ao aguardar RFID:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Simular leitura de RFID (para testes)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tag_uid } = body

    if (!tag_uid) {
      return NextResponse.json(
        { error: "tag_uid é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se a tag já está cadastrada
    const tagExiste = await prisma.usuario.findFirst({
      where: { tag_uid },
    })

    if (tagExiste) {
      return NextResponse.json({
        success: false,
        message: "Tag já cadastrada",
        usuario: {
          id: tagExiste.id,
          nome: tagExiste.nome,
        },
      }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
      tag_uid,
      message: "Tag disponível para cadastro",
    })
  } catch (error) {
    console.error("❌ Erro ao verificar RFID:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}


