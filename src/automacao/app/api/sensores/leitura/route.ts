/**
 * API Route: /api/sensores/leitura
 * Recebe leituras da placa MIO e salva no banco de dados
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dados_mio, timestamp, equipamento_id } = body

    if (!dados_mio) {
      return NextResponse.json(
        { error: "dados_mio é obrigatório" },
        { status: 400 }
      )
    }

    console.log("📊 Leitura do MIO recebida:", {
      relay_id: dados_mio.relay_id,
      equipamento_id_fornecido: equipamento_id,
      dados_keys: Object.keys(dados_mio)
    })

    let equipamentoId = null
    let equipamentoInfo = null

    // PRIORIDADE 1: Usar equipamento_id fornecido diretamente (mais confiável)
    if (equipamento_id) {
      console.log(`✅ Equipamento ID fornecido diretamente: ${equipamento_id}`)
      equipamentoId = equipamento_id

      // Buscar info do equipamento
      equipamentoInfo = await prisma.equipamento.findUnique({
        where: { id: equipamento_id },
        include: {
          sala: {
            select: {
              id: true,
              nome: true,
              predio: true,
            }
          }
        }
      })
      
      if (equipamentoInfo) {
        console.log(`📍 Equipamento: ${equipamentoInfo.nome} | Sala: ${equipamentoInfo.sala?.nome} | Prédio: ${equipamentoInfo.sala?.predio}`)
      }
    }

    // PRIORIDADE 2: Identificar pelo relay_id dos dados recebidos
    if (!equipamentoId) {
      const relayId = dados_mio.relay_id || dados_mio.id
      
      if (relayId) {
        console.log(`🔍 Buscando equipamento com relay_id: ${relayId}`)
      const equipamento = await prisma.equipamento.findFirst({
        where: {
          // @ts-ignore
            relay_id: relayId,
          ativo: true,
        },
          include: {
            sala: {
              select: {
                id: true,
                nome: true,
                predio: true,
              }
            }
          }
        })
        
        if (equipamento) {
          equipamentoId = equipamento.id
          equipamentoInfo = equipamento
          console.log(`✅ Equipamento identificado por relay: ${equipamento.nome} (ID: ${equipamento.id}) | Sala: ${equipamento.sala?.nome}`)
        } else {
          console.warn(`⚠️ Nenhum equipamento encontrado com relay_id: ${relayId}`)
        }
      }
    }

    // ❌ REMOVIDO O FALLBACK PERIGOSO - Se não encontrou, rejeitar!
    if (!equipamentoId) {
      console.error("❌ ERRO: Nenhum equipamento identificado para esta leitura")
      console.error("   - equipamento_id fornecido:", equipamento_id)
      console.error("   - relay_id nos dados:", dados_mio.relay_id || dados_mio.id)
      return NextResponse.json(
        { 
          error: "Nenhum equipamento encontrado para esta leitura",
          detalhes: {
            equipamento_id_fornecido: equipamento_id,
            relay_id: dados_mio.relay_id || dados_mio.id
          }
        },
        { status: 404 }
      )
    }

    // Processar dados específicos do MIO
    const dadosProcessados = processarDadosMIO(dados_mio)

    // Salvar leitura no banco
    const leitura = await prisma.leitura_sensor.create({
      data: {
        equipamento_id: equipamentoId,
        dados_json: dadosProcessados,
      },
    })

    console.log(`✅ Leitura salva no banco - ID: ${leitura.id} | Equipamento: ${equipamentoInfo?.nome || equipamentoId} | Sala: ${equipamentoInfo?.sala?.nome || 'N/A'}`)

    return NextResponse.json({
      success: true,
      leitura_id: Number(leitura.id), 
      dados_processados: dadosProcessados,
    })
  } catch (error: any) {
    console.error(" Erro ao salvar leitura:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao salvar leitura" },
      { status: 500 }
    )
  }
}

/**
 * Processa dados brutos do MIO e extrai informações úteis
 */
function processarDadosMIO(dados: any) {
  const processado: any = {
    raw: dados,
    timestamp_processamento: new Date().toISOString(),
  }

  // Extrair dados de energia (se disponível)
  if (dados.voltage !== undefined) {
    processado.tensao_v = parseFloat(dados.voltage)
  }

  if (dados.current !== undefined) {
    processado.corrente_a = parseFloat(dados.current)
  }

  if (dados.power !== undefined) {
    processado.potencia_w = parseFloat(dados.power)
  }

  if (dados.energy !== undefined) {
    processado.energia_kwh = parseFloat(dados.energy)
  }

  if (dados.frequency !== undefined) {
    processado.frequencia_hz = parseFloat(dados.frequency)
  }

  if (dados.power_factor !== undefined) {
    processado.fator_potencia = parseFloat(dados.power_factor)
  }

  // Extrair dados de temperatura (se disponível)
  if (dados.temperature !== undefined) {
    processado.temperatura_c = parseFloat(dados.temperature)
  }

  if (dados.humidity !== undefined) {
    processado.umidade_pct = parseFloat(dados.humidity)
  }

  // Estado do relay
  if (dados.relay_state !== undefined) {
    processado.relay_estado = dados.relay_state
  }

  if (dados.value !== undefined) {
    processado.relay_value = dados.value
  }

  // Dados de status
  if (dados.command) {
    processado.comando = dados.command
  }

  if (dados.id !== undefined) {
    processado.relay_id = dados.id
  }

  return processado
}

/**
 * GET - Listar últimas leituras
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const equipamento_id = searchParams.get("equipamento_id")
    const limit = parseInt(searchParams.get("limit") || "100")

    const where = equipamento_id 
      ? { equipamento_id: parseInt(equipamento_id) }
      : {}

    const leituras = await prisma.leitura_sensor.findMany({
      where,
      include: {
        equipamento: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            sala: {
              select: {
                id: true,
                nome: true,
                predio: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    })

    // Converter BigInt para Number
    const leiturasSerializadas = leituras.map(l => ({
      ...l,
      id: Number(l.id),
    }))

    // Log detalhado quando busca apenas 1 (tempo real)
    if (limit === 1 && leiturasSerializadas.length > 0) {
      const ultima = leiturasSerializadas[0]
      const dados = ultima.dados_json as any
      console.log('📊 GET /api/sensores/leitura?limit=1 - Última leitura retornada:', {
        id: ultima.id,
        timestamp: ultima.timestamp,
        equipamento: ultima.equipamento?.nome,
        sala: ultima.equipamento?.sala?.nome,
        dados: {
          tensao_v: dados?.tensao_v,
          corrente_a: dados?.corrente_a,
          potencia_w: dados?.potencia_w,
          energia_kwh: dados?.energia_kwh,
          temperatura_c: dados?.temperatura_c,
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: leiturasSerializadas,
      total: leiturasSerializadas.length,
    })
  } catch (error: any) {
    console.error("❌ Erro ao buscar leituras:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

