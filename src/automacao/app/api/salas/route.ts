/**
 * API Route: /api/salas
 * Gerenciamento de salas
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - Lista todas as salas com equipamentos
export async function GET() {
  try {
    const salas = await prisma.sala.findMany({
      include: {
        equipamento: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            identificador: true,
            relay_id: true,
            status: true,
          },
        },
      },
      orderBy: [
        { predio: "asc" },
        { nome: "asc" },
      ],
    })

    // Mapear para o formato esperado pelo frontend
    const salasFormatadas = salas.map((sala) => ({
      id: sala.id,
      nome: sala.nome,
      tipo: sala.tipo,
      predio: sala.predio,
      ativo: sala.status === "ativa",
      capacidade: sala.capacidade,
      andar: sala.andar,
      area_m2: sala.area_m2,
      patrocinada: sala.patrocinada,
      empresa_patrocinadora: sala.empresa_patrocinadora,
      observacoes: sala.observacoes,
      equipamentos: sala.equipamento.map((eq) => ({
        id: eq.id,
        tipo: eq.tipo,
        nome: eq.nome,
        status: eq.status || "ativo",
        identificador: eq.identificador,
        relay_id: eq.relay_id,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: salasFormatadas,
      count: salasFormatadas.length,
    })
  } catch (error) {
    console.error("❌ Erro ao listar salas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Criar nova sala
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      nome,
      tipo,
      predio,
      capacidade,
      andar,
      area_m2,
      patrocinada,
      empresa_patrocinadora,
      observacoes,
      ativo,
      equipamentos,
    } = body

    // Validações básicas
    if (!nome || !tipo || !predio) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, tipo, predio" },
        { status: 400 }
      )
    }

    // Criar sala com equipamentos
    const sala = await prisma.sala.create({
      data: {
        nome,
        tipo,
        predio,
        capacidade: capacidade ? parseInt(capacidade) : 40,
        andar: andar ? parseInt(andar) : null,
        area_m2: area_m2 ? parseFloat(area_m2) : null,
        patrocinada: patrocinada || false,
        empresa_patrocinadora: patrocinada ? empresa_patrocinadora : null,
        observacoes: observacoes || null,
        status: ativo ? "ativa" : "inativa",
        equipamento: {
          create: (equipamentos || []).map((eq: any) => ({
            nome: eq.nome,
            tipo: eq.tipo,
            identificador: eq.identificador,
            relay_id: eq.relay_id ? parseInt(eq.relay_id) : null,
            status: eq.status || "ativo",
            ativo: true,
          })),
        },
      },
      include: {
        equipamento: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: sala,
      message: "Sala criada com sucesso",
    }, { status: 201 })
  } catch (error) {
    console.error("❌ Erro ao criar sala:", error)
    return NextResponse.json(
      { error: "Erro ao criar sala" },
      { status: 500 }
    )
  }
}

