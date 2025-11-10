/**
 * API Route: /api/dashboard/analytics
 * Análise de consumo energético baseado em leitura_sensor
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get("periodo") || "24h"

    // Calcular data inicial baseada no período
    const agora = new Date()
    let dataInicio = new Date()
    
    switch (periodo) {
      case "24h":
        dataInicio.setHours(agora.getHours() - 24)
        break
      case "7d":
        dataInicio.setDate(agora.getDate() - 7)
        break
      case "30d":
        dataInicio.setDate(agora.getDate() - 30)
        break
    }

    // APENAS LEITURAS DE SENSORES (Foco em energia)
    const leiturasRaw = await prisma.leitura_sensor.findMany({
      where: {
        timestamp: {
          gte: dataInicio,
        },
      },
      include: {
        equipamento: {
          include: {
            sala: {
              select: {
                id: true,
                nome: true,
                predio: true,
                tipo: true,
                capacidade: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    })

    // Converter BigInt para Number
    const leituras = leiturasRaw.map(l => ({
      ...l,
      id: Number(l.id),
    }))


    // ========== INSIGHTS BASEADOS APENAS EM LEITURA_SENSOR ==========

    // INSIGHT 1: Consumo Energético por Sala
    const consumoPorSala = calcularConsumoPorSala(leituras)

    // INSIGHT 2: Consumo por Tipo de Equipamento
    const consumoPorTipo = calcularConsumoPorTipo(leituras)

    // INSIGHT 3: Horários de Maior Consumo
    const consumoPorHora = calcularConsumoPorHora(leituras)

    // INSIGHT 4: Temperatura por Sala
    const temperaturaPorSala = calcularTemperaturaPorSala(leituras)

    // INSIGHT 5: Consumo por Bloco
    const consumoPorBloco = calcularConsumoPorBloco(leituras)

    // INSIGHT 6: Análise de Eficiência (Fator de Potência)
    const analiseEficiencia = calcularAnaliseEficiencia(leituras)

    // INSIGHT 7: Variação de Consumo (Tendências)
    const tendenciaConsumo = calcularTendenciaConsumo(leituras)

    return NextResponse.json({
      success: true,
      periodo,
      data: {
        // Totalizadores
        total_leituras: leituras.length,
        consumo_total_kwh: leituras.reduce((acc, l) => acc + ((l.dados_json as any)?.energia_kwh || 0), 0),
        potencia_media_w: leituras.reduce((acc, l) => acc + ((l.dados_json as any)?.potencia_w || 0), 0) / (leituras.length || 1),
        custo_total: leituras.reduce((acc, l) => acc + ((l.dados_json as any)?.energia_kwh || 0), 0) * 0.64,

        // Insights detalhados
        consumo_por_sala: consumoPorSala,
        consumo_por_tipo: consumoPorTipo,
        consumo_por_hora: consumoPorHora,
        temperatura_por_sala: temperaturaPorSala,
        consumo_por_bloco: consumoPorBloco,
        analise_eficiencia: analiseEficiencia,
        tendencia_consumo: tendenciaConsumo,
      },
    })
  } catch (error: any) {
    console.error("Erro ao gerar analytics:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// ========== FUNÇÕES DE CÁLCULO ==========

function calcularConsumoPorSala(leituras: any[]) {
  const consumo = new Map()

  leituras.forEach(l => {
    if (!l.equipamento?.sala) return
    
    const salaKey = `${l.equipamento.sala.id}`
    const atual = consumo.get(salaKey) || {
      sala_id: l.equipamento.sala.id,
      sala_nome: l.equipamento.sala.nome,
      predio: l.equipamento.sala.predio,
      consumo_kwh: 0,
      potencia_media_w: 0,
      pico_potencia_w: 0,
      leituras: 0,
    }

    atual.consumo_kwh += l.dados_json?.energia_kwh || 0
    atual.potencia_media_w += l.dados_json?.potencia_w || 0
    atual.pico_potencia_w = Math.max(atual.pico_potencia_w, l.dados_json?.potencia_w || 0)
    atual.leituras += 1

    consumo.set(salaKey, atual)
  })

  return Array.from(consumo.values())
    .map(s => ({
      ...s,
      potencia_media_w: s.leituras > 0 ? s.potencia_media_w / s.leituras : 0,
      custo_estimado: s.consumo_kwh * 0.64,
    }))
    .sort((a, b) => b.consumo_kwh - a.consumo_kwh)
}


function calcularConsumoPorTipo(leituras: any[]) {
  const consumo = new Map()

  leituras.forEach(l => {
    if (!l.equipamento) return

    const tipo = l.equipamento.tipo
    const atual = consumo.get(tipo) || {
      tipo,
      consumo_kwh: 0,
      potencia_media_w: 0,
      leituras: 0,
      equipamentos: new Set(),
    }

    atual.consumo_kwh += l.dados_json?.energia_kwh || 0
    atual.potencia_media_w += l.dados_json?.potencia_w || 0
    atual.leituras += 1
    atual.equipamentos.add(l.equipamento_id)

    consumo.set(tipo, atual)
  })

  return Array.from(consumo.values())
    .map(c => ({
      tipo: c.tipo,
      consumo_kwh: c.consumo_kwh,
      potencia_media_w: c.leituras > 0 ? c.potencia_media_w / c.leituras : 0,
      equipamentos_count: c.equipamentos.size,
      custo_estimado: c.consumo_kwh * 0.64,
    }))
    .sort((a, b) => b.consumo_kwh - a.consumo_kwh)
}

function calcularConsumoPorHora(leituras: any[]) {
  const porHora = new Array(24).fill(null).map((_, hora) => ({
    hora,
    consumo_kwh: 0,
    potencia_media_w: 0,
    leituras: 0,
  }))

  leituras.forEach(l => {
    if (l.timestamp) {
      const hora = new Date(l.timestamp).getHours()
      porHora[hora].consumo_kwh += l.dados_json?.energia_kwh || 0
      porHora[hora].potencia_media_w += l.dados_json?.potencia_w || 0
      porHora[hora].leituras += 1
    }
  })

  return porHora.map(h => ({
    ...h,
    potencia_media_w: h.leituras > 0 ? h.potencia_media_w / h.leituras : 0,
  }))
}

function calcularTemperaturaPorSala(leituras: any[]) {
  const temp = new Map()

  leituras.forEach(l => {
    if (!l.equipamento?.sala || !l.dados_json?.temperatura_c) return

    const salaKey = `${l.equipamento.sala.id}`
    const atual = temp.get(salaKey) || {
      sala_id: l.equipamento.sala.id,
      sala_nome: l.equipamento.sala.nome,
      predio: l.equipamento.sala.predio,
      temp_media_c: 0,
      umidade_media_pct: 0,
      temp_max_c: -999,
      temp_min_c: 999,
      leituras: 0,
    }

    const temperatura = l.dados_json.temperatura_c
    const umidade = l.dados_json.umidade_pct

    atual.temp_media_c += temperatura
    atual.umidade_media_pct += umidade || 0
    atual.temp_max_c = Math.max(atual.temp_max_c, temperatura)
    atual.temp_min_c = Math.min(atual.temp_min_c, temperatura)
    atual.leituras += 1

    temp.set(salaKey, atual)
  })

  return Array.from(temp.values())
    .map(t => ({
      ...t,
      temp_media_c: t.leituras > 0 ? t.temp_media_c / t.leituras : 0,
      umidade_media_pct: t.leituras > 0 ? t.umidade_media_pct / t.leituras : 0,
    }))
}

function calcularConsumoPorBloco(leituras: any[]) {
  const blocos = ['A', 'B', 'C']
  
  return blocos.map(bloco => {
    const leiturasBloco = leituras.filter(l => l.equipamento?.sala?.predio === bloco)
    const consumo = leiturasBloco.reduce((acc, l) => acc + (l.dados_json?.energia_kwh || 0), 0)
    const potencias = leiturasBloco.map(l => l.dados_json?.potencia_w || 0).filter(p => p > 0)
    const potenciaMedia = potencias.length > 0 ? potencias.reduce((a, b) => a + b, 0) / potencias.length : 0

    return {
      bloco,
      consumo_kwh: consumo,
      potencia_media_w: potenciaMedia,
      custo_estimado: consumo * 0.64,
      leituras: leiturasBloco.length,
    }
  }).sort((a, b) => b.consumo_kwh - a.consumo_kwh)
}

function calcularAnaliseEficiencia(leituras: any[]) {
  const fatoresPotencia = leituras
    .map(l => l.dados_json?.fator_potencia)
    .filter(f => f !== undefined && f !== null)

  const fatorMedio = fatoresPotencia.length > 0
    ? fatoresPotencia.reduce((a, b) => a + b, 0) / fatoresPotencia.length
    : 0

  const equipamentosIneficientes = leituras
    .filter(l => (l.dados_json?.fator_potencia || 1) < 0.85)
    .length

  return {
    fator_potencia_medio: fatorMedio,
    equipamentos_ineficientes: equipamentosIneficientes,
    percentual_ineficiente: leituras.length > 0 ? (equipamentosIneficientes / leituras.length) * 100 : 0,
  }
}

function calcularTendenciaConsumo(leituras: any[]) {
  if (leituras.length < 2) return { variacao_percentual: 0, tendencia: "estavel" }

  // Dividir leituras em primeira e segunda metade do período
  const metade = Math.floor(leituras.length / 2)
  const primeiraMetade = leituras.slice(metade)
  const segundaMetade = leituras.slice(0, metade)

  const consumoPrimeiro = primeiraMetade.reduce((acc, l) => acc + (l.dados_json?.potencia_w || 0), 0) / (primeiraMetade.length || 1)
  const consumoSegundo = segundaMetade.reduce((acc, l) => acc + (l.dados_json?.potencia_w || 0), 0) / (segundaMetade.length || 1)

  const variacao = ((consumoSegundo - consumoPrimeiro) / (consumoPrimeiro || 1)) * 100

  return {
    variacao_percentual: variacao,
    tendencia: variacao > 5 ? "subindo" : variacao < -5 ? "descendo" : "estavel",
    potencia_inicial: consumoPrimeiro,
    potencia_atual: consumoSegundo,
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Método não permitido" },
    { status: 405 }
  )
}

