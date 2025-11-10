/**
 * API Route: GET /api/logs
 * Endpoint para consultar logs do sistema
 */

import { NextRequest, NextResponse } from "next/server"
import { LogService } from "@/lib/services/log.service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nivel = searchParams.get("nivel") as "info" | "warn" | "error" | null
    const origem = searchParams.get("origem")
    const limit = parseInt(searchParams.get("limit") || "100", 10)

    let result

    if (origem) {
      result = await LogService.getLogsByOrigem(origem, limit)
    } else {
      result = await LogService.getRecentLogs(limit, nivel || undefined)
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
    })
  } catch (error) {
    console.error("❌ Erro na API de logs:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

