/**
 * API Route: POST /api/acesso-sala
 * Registra acesso de usuário à sala via RFID
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LogService } from "@/lib/services/log.service"
import { z } from "zod"

const acessoSchema = z.object({
  salaId: z.number().int().positive(),
  cardId: z.string().min(1).max(50),
  tipo: z.enum(["entrada", "saida"]).optional().default("entrada"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salaId, cardId, tipo } = acessoSchema.parse(body)

    // 1. Busca usuário pelo card ID
    const usuario = await prisma.usuario.findUnique({
      where: { tag_uid: cardId },
      select: {
        id: true,
        nome: true,
        tipo: true,
        ativo: true,
      },
    })

    if (!usuario) {
      await LogService.warn("room_access", `Tentativa de acesso com cartão não cadastrado: ${cardId}`)
      return NextResponse.json(
        {
          success: false,
          error: "Cartão não cadastrado no sistema",
        },
        { status: 404 }
      )
    }

    if (!usuario.ativo) {
      await LogService.warn("room_access", `Tentativa de acesso com usuário inativo: ${usuario.nome} (ID=${usuario.id})`)
      return NextResponse.json(
        {
          success: false,
          error: "Usuário inativo",
        },
        { status: 403 }
      )
    }

    // 2. Verifica se sala existe e está ativa
    const sala = await prisma.sala.findUnique({
      where: { id: salaId },
      select: {
        id: true,
        nome: true,
        ativo: true,
      },
    })

    if (!sala) {
      return NextResponse.json(
        {
          success: false,
          error: "Sala não encontrada",
        },
        { status: 404 }
      )
    }

    if (!sala.ativo) {
      await LogService.warn("room_access", `Tentativa de acesso à sala inativa: ${sala.nome} (ID=${sala.id})`)
      return NextResponse.json(
        {
          success: false,
          error: "Sala em manutenção",
        },
        { status: 403 }
      )
    }

    // 3. Verifica permissão (visitantes não têm acesso automático)
    if (usuario.tipo === "visitante") {
      await LogService.warn(
        "room_access",
        `Visitante ${usuario.nome} (ID=${usuario.id}) tentou acessar sala ${sala.nome} sem autorização`
      )
      return NextResponse.json(
        {
          success: false,
          error: "Visitantes necessitam autorização prévia",
        },
        { status: 403 }
      )
    }

    // 4. Registra acesso
    const acesso = await prisma.acesso_sala.create({
      data: {
        usuario_id: usuario.id,
        sala_id: sala.id,
        tipo,
      },
      select: {
        id: true,
        timestamp: true,
        tipo: true,
      },
    })

    // 5. Registra log
    await LogService.logRoomAccess(usuario.id, sala.id, tipo)

    console.log(
      `✅ Acesso registrado: ${usuario.nome} → ${sala.nome} (${tipo})`
    )

    return NextResponse.json({
      success: true,
      data: {
        acesso,
        usuario: {
          nome: usuario.nome,
          tipo: usuario.tipo,
        },
        sala: {
          nome: sala.nome,
        },
      },
      message: `Acesso ${tipo === "entrada" ? "liberado" : "registrado"}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 422 }
      )
    }

    console.error("❌ Erro ao processar acesso:", error)
    await LogService.logSystemError("room_access", "Erro ao processar acesso à sala", error)
    
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

