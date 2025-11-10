/**
 * API Route: /api/acesso/verificar
 * Verifica se usuário tem acesso à sala baseado em reservas
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// 🧪 MODO DE TESTE - Permite acesso sem verificar reserva
// ⚠️ ATENÇÃO: Mudar para false em produção!
const MODO_TESTE = false

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tag_uid, sala_id } = body

    if (!tag_uid || !sala_id) {
      return NextResponse.json(
        { error: "Campos obrigatórios: tag_uid, sala_id" },
        { status: 400 }
      )
    }

    // 1. Buscar usuário pelo RFID
    const usuario = await prisma.usuario.findUnique({
      where: { tag_uid },
      select: {
        id: true,
        nome: true,
        tipo: true,
        ativo: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({
        autorizado: false,
        motivo: "Cartão não cadastrado no sistema",
      })
    }

    if (!usuario.ativo) {
      return NextResponse.json({
        autorizado: false,
        usuario: {
          nome: usuario.nome,
          tipo: usuario.tipo || "usuario",
        },
        motivo: "Usuário desativado no sistema",
      })
    }

    // 2. Verificar se a sala está ativa
    // @ts-ignore - Prisma Client atualizado
    const sala = await prisma.sala.findUnique({
      where: { id: parseInt(sala_id) },
      include: {
        equipamento: {
          where: {
            ativo: true,
            status: "ativo",
            // @ts-ignore
            relay_id: {
              not: null,
            },
          },
          select: {
            id: true,
            // @ts-ignore
            relay_id: true,
            nome: true,
            tipo: true,
          },
        },
      },
    })

    if (!sala) {
      return NextResponse.json({
        autorizado: false,
        usuario: {
          nome: usuario.nome,
          tipo: usuario.tipo || "usuario",
        },
        motivo: "Sala não encontrada",
      })
    }

    if (sala.status !== "ativa") {
      return NextResponse.json({
        autorizado: false,
        usuario: {
          nome: usuario.nome,
          tipo: usuario.tipo || "usuario",
        },
        motivo: "Sala inativa ou em manutenção",
      })
    }

    // 3. Verificar se usuário tem reserva ativa para esta sala
    let reservaAtiva = null
    
    console.log(`🔐 Verificando acesso: Usuário "${usuario.nome}" (ID: ${usuario.id}) → Sala "${sala.nome}" (ID: ${sala_id})`)
    
    // 🧪 MODO DE TESTE ATIVO - Bypassa verificação de reserva
    if (MODO_TESTE) {
      console.log("🧪 MODO DE TESTE ATIVO - Acesso liberado sem verificar reserva")
      reservaAtiva = {
        disciplina: "[MODO TESTE]",
        hora_inicio: new Date(),
        hora_fim: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 horas
      }
    } else {
      // Verificação normal de reserva
      console.log(`🔍 Buscando reservas do usuário ${usuario.nome} para a sala ${sala.nome}...`)
      const agora = new Date()
      const horaAtual = agora.getHours() * 60 + agora.getMinutes()
      const diaAtual = getDiaSemanaAtual()

      // Buscar reservas fixas do dia atual
      const reservasFixas = await prisma.$queryRaw<Array<any>>`
        SELECT r.*, u.nome as professor_nome
        FROM reserva r
        JOIN usuario u ON r.usuario_id = u.id
        WHERE r.sala_id = ${parseInt(sala_id)}
          AND r.usuario_id = ${usuario.id}
          AND r.status = 'ativa'
          AND r.tipo = 'fixa'
          AND r.dia_semana = ${diaAtual}
      `

      // Buscar reservas temporárias/eventos da data atual
      const dataAtual = agora.toISOString().split('T')[0]
      const reservasTemporarias = await prisma.$queryRaw<Array<any>>`
        SELECT r.*, u.nome as professor_nome
        FROM reserva r
        JOIN usuario u ON r.usuario_id = u.id
        WHERE r.sala_id = ${parseInt(sala_id)}
          AND r.usuario_id = ${usuario.id}
          AND r.status = 'ativa'
          AND r.tipo IN ('temporaria', 'evento')
          AND r.data_inicio <= ${dataAtual}
          AND (r.data_fim >= ${dataAtual} OR r.data_fim IS NULL)
      `

      const todasReservas = [...reservasFixas, ...reservasTemporarias]

      console.log(`📋 Encontradas ${todasReservas.length} reserva(s) do usuário para esta sala`)

      // Verificar se alguma reserva está no horário atual
      for (const reserva of todasReservas) {
        const horaInicio = new Date(reserva.hora_inicio).getHours() * 60 + new Date(reserva.hora_inicio).getMinutes()
        const horaFim = new Date(reserva.hora_fim).getHours() * 60 + new Date(reserva.hora_fim).getMinutes()

        console.log(`   - Reserva: ${reserva.disciplina || 'N/A'} | ${horaInicio} - ${horaFim} min | Hora atual: ${horaAtual} min`)

        if (horaAtual >= horaInicio && horaAtual < horaFim) {
          reservaAtiva = reserva
          console.log(`   ✅ RESERVA ATIVA ENCONTRADA!`)
          break
        }
      }

      if (!reservaAtiva) {
        console.log(`❌ ACESSO NEGADO: Usuário "${usuario.nome}" NÃO possui reserva ativa para "${sala.nome}" no horário atual`)
        console.log(`   Horário atual: ${agora.toLocaleTimeString('pt-BR')} (${horaAtual} minutos)`)
        return NextResponse.json({
          autorizado: false,
          usuario: {
            nome: usuario.nome,
            tipo: usuario.tipo || "usuario",
          },
          motivo: "Você não possui reserva ativa para esta sala no horário atual",
        })
      }

      console.log(`✅ Reserva válida: ${reservaAtiva.disciplina}`)
    }

    // 4. Verificar último acesso do usuário nesta sala
    const ultimoAcesso = await prisma.acesso_sala.findFirst({
      where: {
        usuario_id: usuario.id,
        sala_id: parseInt(sala_id),
      },
      orderBy: {
        timestamp: "desc",
      },
    })

    // Determinar se é entrada ou saída
    let tipoAcesso: "entrada" | "saida" = "entrada"
    let acao: "ON" | "OFF" = "ON"
    
    // Se último acesso foi entrada recente (menos de 4 horas), registrar como saída
    if (ultimoAcesso && ultimoAcesso.tipo === "entrada" && ultimoAcesso.timestamp) {
      const horasDesdeEntrada = (Date.now() - ultimoAcesso.timestamp.getTime()) / (1000 * 60 * 60)
      if (horasDesdeEntrada < 4) {
        tipoAcesso = "saida"
        acao = "OFF"
      }
    }

    // 5. Registrar acesso
    await prisma.acesso_sala.create({
      data: {
        usuario_id: usuario.id,
        sala_id: parseInt(sala_id),
        tipo: tipoAcesso,
      },
    })

    // 6. Coletar IDs dos relays
    // @ts-ignore
    const relayIds = sala.equipamento
      .map((eq: any) => eq.relay_id)
      .filter((id: any): id is number => id !== null)

    // 7. Retornar acesso autorizado
    console.log(`✅ ACESSO AUTORIZADO: "${usuario.nome}" → "${sala.nome}" | ${tipoAcesso.toUpperCase()} | Equipamentos: ${relayIds.length}`)
    
    return NextResponse.json({
      autorizado: true,
      usuario: {
        nome: usuario.nome,
        tipo: usuario.tipo || "usuario",
      },
      reserva: {
        disciplina: reservaAtiva.disciplina || "Reserva",
        horario: `${new Date(reservaAtiva.hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - ${new Date(reservaAtiva.hora_fim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      },
      tipo_acesso: tipoAcesso,
      acao_equipamentos: acao,
      equipamentos_ativados: relayIds,
    })
  } catch (error) {
    console.error("❌ Erro ao verificar acesso:", error)
    return NextResponse.json(
      { error: "Erro ao verificar acesso" },
      { status: 500 }
    )
  }
}

function getDiaSemanaAtual(): string {
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"]
  return dias[new Date().getDay()]
}

