/**
 * API Route: /api/equipamentos/ativar
 * Ativa equipamentos via relays (mio-server)
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const MIO_SERVER_URL = process.env.MIO_SERVER_URL || "http://localhost:3001"

/**
 * Gera dados de leitura baseados no tipo de equipamento e estado do relay
 */
async function gerarLeituraDoRelay(equipamento: any, relayId: number, action: string) {
  if (!equipamento) return null
  
  const isOn = action === "ON"
  const tipo = equipamento.tipo
  
  // Valores base por tipo de equipamento (quando ligado)
  const valoresPorTipo: Record<string, any> = {
    luz: {
      voltage: 220.0,
      current: isOn ? 0.8 : 0.05,
      power: isOn ? 176 : 0,
      energy: isOn ? 0.18 : 0.001, // Standby consome um pouco
      frequency: 60.0,
      power_factor: isOn ? 0.95 : 0.80,
      temperature: 22.0 + (isOn ? 3.0 : 0),
    },
    ar_condicionado: {
      voltage: 220.0,
      current: isOn ? 5.8 : 0.3,
      power: isOn ? 1280 : 15, // Standby consome ~15W
      energy: isOn ? 1.3 : 0.015,
      frequency: 60.0,
      power_factor: isOn ? 0.92 : 0.75,
      temperature: isOn ? 18.5 : 25.0,
      humidity: isOn ? 55.0 : 65.0,
    },
    projetor: {
      voltage: 220.0,
      current: isOn ? 1.5 : 0.08,
      power: isOn ? 330 : 8, // Standby ~8W
      energy: isOn ? 0.33 : 0.008,
      frequency: 60.0,
      power_factor: isOn ? 0.88 : 0.70,
      temperature: 23.0 + (isOn ? 5.0 : 0),
    },
    computador: {
      voltage: 220.0,
      current: isOn ? 2.3 : 0.15,
      power: isOn ? 506 : 12, // Standby ~12W
      energy: isOn ? 0.51 : 0.012,
      frequency: 60.0,
      power_factor: isOn ? 0.98 : 0.85,
      temperature: 24.0 + (isOn ? 6.0 : 0),
    },
    tomada: {
      voltage: 220.0,
      current: isOn ? 1.2 : 0.06,
      power: isOn ? 264 : 5, // Standby ~5W
      energy: isOn ? 0.26 : 0.005,
      frequency: 60.0,
      power_factor: isOn ? 0.95 : 0.78,
      temperature: 22.5,
    },
  }
  
  const valores = valoresPorTipo[tipo] || valoresPorTipo.tomada
  
  // Adicionar pequena variação aleatória para simular leitura real
  const variacao = () => 1 + (Math.random() * 0.1 - 0.05) // ±5%
  
  return {
    voltage: valores.voltage * variacao(),
    current: valores.current * variacao(),
    power: valores.power * variacao(),
    energy: valores.energy * variacao(),
    frequency: valores.frequency * variacao(),
    power_factor: valores.power_factor * variacao(),
    temperature: valores.temperature ? valores.temperature * variacao() : 22.0,
    humidity: valores.humidity ? valores.humidity * variacao() : 60.0,
    relay_id: relayId,
    relay_state: isOn ? 1 : 0,
    timestamp: new Date().toISOString(),
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sala_id, relay_ids, action = "ON" } = body

    if (!sala_id || !relay_ids || !Array.isArray(relay_ids)) {
      return NextResponse.json(
        { error: "Campos obrigatórios: sala_id, relay_ids (array)" },
        { status: 400 }
      )
    }

    const resultados = []

    // Enviar comando para cada relay
    for (const relayId of relay_ids) {
      try {
        // Enviar comando (ON ou OFF) para o mio-server
        const response = await fetch(`${MIO_SERVER_URL}/mio/relay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: action, // Agora pode ser ON ou OFF
            relay: relayId,
          }),
        })

        // Verificar se resposta é JSON válido
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`MIO Server não está respondendo. Verifique se está rodando na porta 3001`)
        }

        const result = await response.json()

        if (response.ok && result.ok) {
          console.log(`✅ Relay ${relayId} ${action === "ON" ? "ligado" : "desligado"} com sucesso`)
          resultados.push({
            relay_id: relayId,
            status: "success",
            message: result.message,
          })

          // Registrar ação no banco
          // @ts-ignore
          const equipamento = await prisma.equipamento.findFirst({
            where: {
              sala_id: parseInt(sala_id),
              // @ts-ignore
              relay_id: relayId,
            },
          })

          if (equipamento) {
            await prisma.acao_equipamento.create({
              data: {
                equipamento_id: equipamento.id,
                comando: action, // ON ou OFF
                origem: "automatica",
                resultado: "sucesso",
              },
            })
          }

          // 🔥 NOVO: Capturar leitura automática após acionar relay
          // Aguardar 1.5s para o relay estabilizar e então capturar dados
          setTimeout(async () => {
            try {
              // Criar leitura simulada baseada no estado do relay e equipamento
              const dadosLeitura = await gerarLeituraDoRelay(equipamento, relayId, action);
              
              if (dadosLeitura && equipamento) {
                console.log(`📊 Gerando leitura para: ${equipamento.nome} (Sala ID: ${sala_id}, Equipamento ID: ${equipamento.id}, Relay: ${relayId})`)
                
                // Salvar leitura no banco COM O EQUIPAMENTO_ID CORRETO
                const leituraResponse = await fetch(`http://localhost:3000/api/sensores/leitura`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    dados_mio: dadosLeitura,
                    equipamento_id: equipamento.id, // ✅ PASSA O ID CORRETO DO EQUIPAMENTO
                    timestamp: new Date().toISOString(),
                  }),
                })
                
                const leituraResult = await leituraResponse.json()
                if (leituraResult.success) {
                  console.log(`✅ Leitura salva: ${equipamento.nome} (Sala: ${sala_id}) - Leitura ID: ${leituraResult.leitura_id}`)
                } else {
                  console.error(`❌ Erro ao salvar leitura:`, leituraResult.error)
                }
              }
            } catch (err: any) {
              console.log(`⚠️ Erro ao capturar leitura do Relay ${relayId}:`, err?.message || err)
            }
          }, 1500)
        } else {
          resultados.push({
            relay_id: relayId,
            status: "error",
            message: result.error || "Erro ao ativar relay",
          })
        }
      } catch (error) {
        console.error(`Erro ao ativar relay ${relayId}:`, error)
        resultados.push({
          relay_id: relayId,
          status: "error",
          message: "Falha na comunicação com o servidor MIO",
        })
      }
    }

    const sucesso = resultados.filter(r => r.status === "success").length
    const total = resultados.length

    return NextResponse.json({
      success: sucesso > 0,
      message: `${sucesso}/${total} equipamentos ativados`,
      resultados,
    })
  } catch (error) {
    console.error("❌ Erro ao ativar equipamentos:", error)
    return NextResponse.json(
      { error: "Erro ao ativar equipamentos" },
      { status: 500 }
    )
  }
}

// Endpoint para desligar equipamentos
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { sala_id, relay_ids } = body

    if (!sala_id || !relay_ids || !Array.isArray(relay_ids)) {
      return NextResponse.json(
        { error: "Campos obrigatórios: sala_id, relay_ids (array)" },
        { status: 400 }
      )
    }

    const resultados = []

    // Enviar comando OFF para cada relay
    for (const relayId of relay_ids) {
      try {
        const response = await fetch(`${MIO_SERVER_URL}/mio/relay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "OFF",
            relay: relayId,
          }),
        })

        const result = await response.json()

        if (response.ok && result.ok) {
          resultados.push({
            relay_id: relayId,
            status: "success",
          })

          // Registrar ação no banco
          // @ts-ignore
          const equipamento = await prisma.equipamento.findFirst({
            where: {
              sala_id: parseInt(sala_id),
              // @ts-ignore
              relay_id: relayId,
            },
          })

          if (equipamento) {
            await prisma.acao_equipamento.create({
              data: {
                equipamento_id: equipamento.id,
                comando: "OFF",
                origem: "automatica",
                resultado: "sucesso",
              },
            })

            // 🔥 Capturar leitura ao DESLIGAR também
            setTimeout(async () => {
              try {
                const dadosLeitura = await gerarLeituraDoRelay(equipamento, relayId, "OFF");
                
                if (dadosLeitura) {
                  console.log(`📊 Gerando leitura OFF para: ${equipamento.nome} (Sala ID: ${sala_id}, Equipamento ID: ${equipamento.id}, Relay: ${relayId})`)
                  
                  const leituraResponse = await fetch(`http://localhost:3000/api/sensores/leitura`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      dados_mio: dadosLeitura,
                      equipamento_id: equipamento.id, // ✅ PASSA O ID CORRETO DO EQUIPAMENTO
                      timestamp: new Date().toISOString(),
                    }),
                  })
                  
                  const leituraResult = await leituraResponse.json()
                  if (leituraResult.success) {
                    console.log(`✅ Leitura OFF salva: ${equipamento.nome} (Sala: ${sala_id}) - Leitura ID: ${leituraResult.leitura_id}`)
                  } else {
                    console.error(`❌ Erro ao salvar leitura OFF:`, leituraResult.error)
                  }
                }
              } catch (err: any) {
                console.log(`⚠️ Erro ao capturar leitura OFF do Relay ${relayId}:`, err?.message || err)
              }
            }, 1500)
          }
        } else {
          resultados.push({
            relay_id: relayId,
            status: "error",
          })
        }
      } catch (error) {
        console.error(`Erro ao desativar relay ${relayId}:`, error)
        resultados.push({
          relay_id: relayId,
          status: "error",
        })
      }
    }

    const sucesso = resultados.filter(r => r.status === "success").length

    return NextResponse.json({
      success: sucesso > 0,
      message: `${sucesso}/${resultados.length} equipamentos desativados`,
      resultados,
    })
  } catch (error) {
    console.error("❌ Erro ao desativar equipamentos:", error)
    return NextResponse.json(
      { error: "Erro ao desativar equipamentos" },
      { status: 500 }
    )
  }
}

