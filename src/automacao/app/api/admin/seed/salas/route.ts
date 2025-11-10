/**
 * API Route: POST /api/admin/seed/salas
 * Popula banco com salas de exemplo (apenas desenvolvimento)
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    // Criar salas de exemplo
    const salas = await prisma.$transaction([
      prisma.sala.create({
        data: {
          nome: "Lab. Informática 301",
          tipo: "lab_info",
          predio: "A",
          patrocinada: false,
          ativo: true,
        },
      }),
      prisma.sala.create({
        data: {
          nome: "Sala de Aula 205",
          tipo: "aula",
          predio: "B",
          patrocinada: false,
          ativo: true,
        },
      }),
      prisma.sala.create({
        data: {
          nome: "Lab. Maker 102",
          tipo: "lab_make",
          predio: "A",
          patrocinada: true,
          empresa_patrocinadora: "FECAP Tech",
          ativo: true,
        },
      }),
      prisma.sala.create({
        data: {
          nome: "Auditório Principal",
          tipo: "teatro",
          predio: "C",
          patrocinada: false,
          ativo: true,
        },
      }),
    ])

    console.log(`✅ ${salas.length} salas criadas com sucesso`)

    // Buscar professores para criar horários
    const professores = await prisma.usuario.findMany({
      where: { tipo: "professor" },
      take: 2,
    })

    let horariosCount = 0

    // Se existirem professores, criar horários de exemplo
    if (professores.length > 0 && salas.length > 0) {
      const horarios = await prisma.horario_fixo.createMany({
        data: [
          {
            sala_id: salas[0].id, // Lab 301
            usuario_id: professores[0].id,
            dia_semana: "seg",
            hora_inicio: new Date("1970-01-01T14:00:00"),
            hora_fim: new Date("1970-01-01T16:00:00"),
          },
          {
            sala_id: salas[1].id, // Sala 205
            usuario_id: professores[professores.length > 1 ? 1 : 0].id,
            dia_semana: "ter",
            hora_inicio: new Date("1970-01-01T10:00:00"),
            hora_fim: new Date("1970-01-01T12:00:00"),
          },
        ],
        skipDuplicates: true,
      })
      horariosCount = horarios.count
    }

    return NextResponse.json({
      success: true,
      message: "Salas de exemplo criadas com sucesso",
      data: {
        salas: salas.map((s) => ({ id: s.id, nome: s.nome, predio: s.predio })),
        horariosCriados: horariosCount,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao criar salas:", error)
    return NextResponse.json(
      {
        error: "Erro ao criar salas de exemplo",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    )
  }
}

