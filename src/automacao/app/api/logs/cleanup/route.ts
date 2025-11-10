/**
 * API Route: POST /api/logs/cleanup
 * Endpoint para limpar logs antigos (manutenção)
 */

import { NextRequest, NextResponse } from "next/server"
import { LogService } from "@/lib/services/log.service"
import { z } from "zod"

const cleanupSchema = z.object({
  daysOld: z.number().int().min(1).max(365).optional().default(30),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { daysOld } = cleanupSchema.parse(body)

    const result = await LogService.cleanOldLogs(daysOld)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Registra a própria limpeza
    await LogService.info(
      "log_maintenance",
      `Limpeza de logs executada: ${result.deleted} registros removidos (>${daysOld} dias)`,
    )

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      message: `${result.deleted} logs removidos com sucesso`,
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
        { status: 422 },
      )
    }

    console.error("❌ Erro ao limpar logs:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

