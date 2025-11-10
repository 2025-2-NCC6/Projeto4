"use client"

import React, { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock,
  User,
  Lightbulb,
  Projector,
  Wind,
  Wifi,
  Speaker,
  Thermometer,
  Power,
  Loader2,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRef } from "react"

type Sala = {
  id: number
  nome: string
  predio: string
  tipo: string
  equipamentos: Array<{
    id: number
    nome: string
    tipo: string
    relay_id: number | null
    status: string
  }>
}

type ResultadoAcesso = {
  autorizado: boolean
  usuario?: {
    nome: string
    tipo: string
  }
  reserva?: {
    disciplina: string
    horario: string
  }
  motivo?: string
  equipamentos_ativados?: number[]
  tipo_acesso?: "entrada" | "saida"
  acao_equipamentos?: "ON" | "OFF"
}

export default function SimulacaoSalaPage() {
  const { toast } = useToast()
  const [salas, setSalas] = useState<Sala[]>([])
  const [salaAtual, setSalaAtual] = useState<string>("")
  const [isAguardando, setIsAguardando] = useState(false)
  const [resultadoAcesso, setResultadoAcesso] = useState<ResultadoAcesso | null>(null)
  const [isProcessando, setIsProcessando] = useState(false)
  const [historicoAcessos, setHistoricoAcessos] = useState<Array<ResultadoAcesso & { timestamp: Date }>>([])
  const [ultimoCardIdProcessado, setUltimoCardIdProcessado] = useState<string | null>(null)
  const [ultimoTimestampProcessado, setUltimoTimestampProcessado] = useState<number>(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    fetchSalas()
  }, [])

  // Gerenciar conexão SSE para leitura contínua de RFID
  useEffect(() => {
    if (!isAguardando || !salaAtual) {
      // Fechar conexão existente se houver
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
        console.log("🔌 Conexão SSE fechada")
      }
      return
    }

    // Iniciar nova conexão SSE com sessionId único
    const sessionId = `simulacao_sala_${Date.now()}`
    const url = `/api/rfid/stream?sessionId=${sessionId}`
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    console.log(`📡 Conectando ao stream RFID com sessionId: ${sessionId}`)

    eventSource.onopen = () => {
      console.log("✅ Conexão SSE estabelecida com sucesso")
    }

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("📨 Evento SSE recebido:", data)
        
        if (data.type === "card_read" && data.cardId) {
          const agora = Date.now()
          const intervaloMinimo = 2500 // 2.5 segundos entre leituras

          // Verificar se não está processando e se passou tempo suficiente
          const podeProcessar = 
            !isProcessando && 
            (agora - ultimoTimestampProcessado) > intervaloMinimo

          if (podeProcessar) {
            console.log(`💳 NOVA leitura RFID: ${data.cardId}`)
            setUltimoCardIdProcessado(data.cardId)
            setUltimoTimestampProcessado(agora)
            await verificarAcesso(data.cardId)
          } else {
            console.log(`⏭️ Ignorando leitura (processando ou aguardando intervalo de ${intervaloMinimo}ms)`)
          }
        } else if (data.type === "connected") {
          console.log("✅ Stream conectado, aguardando cartões...")
        } else if (data.type === "heartbeat") {
          // Heartbeat para manter conexão viva
        }
      } catch (error) {
        console.error("Erro ao processar evento SSE:", error)
      }
    }

    eventSource.onerror = (err) => {
      console.error("❌ Erro na conexão SSE:", err)
      // Tentar reconectar após 2 segundos
      setTimeout(() => {
        if (isAguardando && salaAtual) {
          console.log("🔄 Tentando reconectar SSE...")
          eventSource.close()
        }
      }, 2000)
    }

    // Cleanup ao desmontar
    return () => {
      console.log("🔌 Limpando conexão SSE")
      eventSource.close()
    }
  }, [isAguardando, salaAtual]) // Removido isProcessando e ultimoTimestampProcessado para evitar reconexões desnecessárias

  const fetchSalas = async () => {
    try {
      const response = await fetch("/api/salas")
      const result = await response.json()
      
      if (result.success) {
        setSalas(result.data.filter((s: any) => s.ativo))
      }
    } catch (error) {
      console.error("Erro ao carregar salas:", error)
    }
  }

  const iniciarLeitura = () => {
    if (!salaAtual) {
      toast({
        title: "⚠️ Selecione uma sala",
        description: "Você precisa selecionar uma sala antes de iniciar a leitura.",
        variant: "destructive",
      })
      return
    }

    setIsAguardando(true)
    setResultadoAcesso(null)
    setUltimoCardIdProcessado(null)
    setUltimoTimestampProcessado(0)

    toast({
      title: "📡 Leitor Ativo",
      description: "Sistema aguardando leituras de cartão. Passe o cartão quantas vezes quiser!",
      duration: 3000,
    })
  }

  const cancelarLeitura = () => {
    setIsAguardando(false)
    setUltimoCardIdProcessado(null)
    setUltimoTimestampProcessado(0)
    setResultadoAcesso(null)
    
    toast({
      title: "⏹️ Leitura Parada",
      description: "Sistema desativado. Clique em 'Iniciar' para começar novamente.",
      duration: 2000,
    })
  }

  const verificarAcesso = async (tag_uid: string) => {
    setIsProcessando(true)

    try {
      const response = await fetch("/api/acesso/verificar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag_uid,
          sala_id: parseInt(salaAtual),
        }),
      })

      const result = await response.json()

      // Atualizar resultado atual
      setResultadoAcesso(result)

      // Adicionar ao histórico
      setHistoricoAcessos(prev => [
        { ...result, timestamp: new Date() },
        ...prev.slice(0, 4) // Manter apenas últimos 5
      ])

      if (result.autorizado) {
        const isEntrada = result.tipo_acesso === "entrada"
        const acao = result.acao_equipamentos || "ON"
        
        // Acesso autorizado - controlar equipamentos
        if (result.equipamentos_ativados && result.equipamentos_ativados.length > 0) {
          await ativarEquipamentos(result.equipamentos_ativados, acao)
        }

        toast({
          title: isEntrada ? "🟢 Entrada Autorizada" : "🔴 Saída Registrada",
          description: isEntrada 
            ? `Bem-vindo, ${result.usuario?.nome}! Equipamentos LIGADOS.`
            : `Até breve, ${result.usuario?.nome}! Equipamentos DESLIGADOS.`,
        })
      } else {
        // Mensagem personalizada para acesso negado
        const mensagemNegado = result.motivo?.includes("reserva") || result.motivo?.includes("horário")
          ? "Entre no portal do usuário e faça uma reserva para esta sala."
          : result.motivo?.includes("cadastrado")
          ? "Cartão não cadastrado. Realize seu cadastro no totem principal."
          : "Verifique suas permissões no portal do usuário."

        toast({
          title: "🔒 Acesso Negado",
          description: mensagemNegado,
          variant: "destructive",
          duration: 4000,
        })
      }

      // 🔥 AUTO-LIMPAR RESULTADO APÓS 4 SEGUNDOS PARA CONTINUAR LENDO
      setTimeout(() => {
        setResultadoAcesso(null)
        console.log("🔄 Resultado limpo - Sistema continua ativo aguardando próxima leitura")
      }, 4000)

    } catch (error) {
      console.error("Erro ao verificar acesso:", error)
      toast({
        title: "❌ Erro",
        description: "Erro ao verificar acesso. Tente novamente.",
        variant: "destructive",
      })
      
      // Limpar erro também após 4 segundos
      setTimeout(() => {
        setResultadoAcesso(null)
        console.log("🔄 Erro limpo - Sistema continua ativo")
      }, 4000)
    } finally {
      setIsProcessando(false)
      // Sistema continua aguardando próximas leituras automaticamente
    }
  }

  const ativarEquipamentos = async (relayIds: number[], action: "ON" | "OFF" = "ON") => {
    try {
      console.log(`${action === "ON" ? "🟢 Ligando" : "🔴 Desligando"} equipamentos:`, relayIds)
      
      const response = await fetch("/api/equipamentos/ativar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sala_id: parseInt(salaAtual),
          relay_ids: relayIds,
          action: action,
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log(`✅ Equipamentos ${action === "ON" ? "ligados" : "desligados"} com sucesso`)
      } else {
        console.error("Erro ao controlar equipamentos:", result.error)
      }
    } catch (error) {
      console.error("Erro ao controlar equipamentos:", error)
    }
  }

  const salaEscolhida = salas.find(s => s.id.toString() === salaAtual)

  const getEquipamentoIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      luz: Lightbulb,
      projetor: Projector,
      ar_condicionado: Wind,
      sensor: Thermometer,
      audio: Speaker,
      rede: Wifi,
    }
    return icons[tipo] || Power
  }

  return (
   
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#006241] to-[#00A86B] bg-clip-text text-transparent">
            Simulação de Acesso à Sala
          </h1>
          <p className="text-slate-600 mt-2">Simule o acesso de um usuário e veja os equipamentos sendo ativados automaticamente</p>
          <Badge className="mt-3 bg-green-500">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
            Modo Contínuo • Múltiplas Leituras
          </Badge>
        </div>

        {/* Seleção de Sala */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Selecione a Sala</label>
              <Select value={salaAtual} onValueChange={setSalaAtual}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha uma sala..." />
                </SelectTrigger>
                <SelectContent>
                  {salas.map((sala) => (
                    <SelectItem key={sala.id} value={sala.id.toString()}>
                      {sala.nome} - Prédio {sala.predio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {salaEscolhida && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#006241] to-[#00A86B] rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{salaEscolhida.nome}</h3>
                  <Badge className="bg-[#006241] text-white">Prédio {salaEscolhida.predio}</Badge>
                </div>
                
                {salaEscolhida.equipamentos.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-600 mb-2">
                      {salaEscolhida.equipamentos.length} equipamento(s) configurado(s)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {salaEscolhida.equipamentos.map((eq) => {
                        const Icon = getEquipamentoIcon(eq.tipo)
                        return (
                          <div
                            key={eq.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-slate-200 text-xs"
                          >
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            <span>{eq.nome}</span>
                            {eq.relay_id && (
                              <Badge variant="outline" className="text-xs ml-1">
                                Relay {eq.relay_id}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Leitor RFID */}
        <Card className={`p-8 border-2 transition-all ${
          isAguardando 
            ? "border-green-500 bg-green-50/50" 
            : "border-slate-200"
        }`}>
          <div className="text-center space-y-6">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-lg transition-all ${
              isAguardando
                ? "bg-gradient-to-br from-green-500 to-green-600 animate-pulse"
                : "bg-gradient-to-br from-[#132B1E] to-[#1a3d2b]"
            }`}>
              <CreditCard className={`w-12 h-12 ${
                isAguardando ? "text-white" : "text-[#B39C66]"
              }`} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isAguardando 
                  ? isProcessando 
                    ? "Processando..." 
                    : "✅ Leitor Ativo" 
                  : "Pronto para Ler"}
              </h2>
              {isAguardando && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-semibold">
                      {isProcessando ? "Verificando acesso..." : "Aguardando próxima passada de cartão..."}
                    </span>
                  </div>
                    <Badge variant="outline" className="border-green-500 text-green-700">
                    📡 Stream RFID ativo
                    </Badge>
                </div>
              )}
            </div>

            {!isAguardando ? (
              <Button
                size="lg"
                onClick={iniciarLeitura}
                disabled={!salaAtual}
                className="bg-gradient-to-r from-[#006241] to-[#00A86B] hover:from-[#004d33] hover:to-[#008659] text-white gap-2 shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                Iniciar Leitura Contínua
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-sm text-green-700 font-semibold">
                    Passe o cartão quantas vezes quiser - Sistema em modo contínuo!
                  </p>
                </div>
                <p className="text-xs text-slate-600">
                  ✓ Alterna automaticamente entre entrada/saída
                  <br />
                  ✓ Resultado aparece por 4s e depois limpa sozinho
                  <br />
                  ✓ Intervalo mínimo: 2.5s entre leituras
                  <br />
                  ✓ Sistema continua ativo mesmo se cartão não tiver acesso
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={cancelarLeitura}
                  className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Parar Leitura
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Resultado do Acesso */}
        {resultadoAcesso && (
          <Card className={`p-6 border-2 animate-in fade-in-50 slide-in-from-top-4 ${
            resultadoAcesso.autorizado 
              ? resultadoAcesso.tipo_acesso === "entrada"
                ? "border-green-500 bg-green-50"
                : "border-blue-500 bg-blue-50"
              : "border-red-500 bg-red-50"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                resultadoAcesso.autorizado 
                  ? resultadoAcesso.tipo_acesso === "entrada"
                    ? "bg-green-500"
                    : "bg-blue-500" 
                  : "bg-red-500"
              }`}>
                {resultadoAcesso.autorizado ? (
                  <CheckCircle2 className="w-8 h-8 text-white" />
                ) : (
                  <XCircle className="w-8 h-8 text-white" />
                )}
              </div>

              <div className="flex-1">
                <h3 className={`text-2xl font-bold mb-2 ${
                  resultadoAcesso.autorizado 
                    ? resultadoAcesso.tipo_acesso === "entrada" 
                      ? "text-green-900" 
                      : "text-blue-900"
                    : "text-red-900"
                }`}>
                  {resultadoAcesso.autorizado 
                    ? resultadoAcesso.tipo_acesso === "entrada"
                      ? "🟢 Entrada Autorizada"
                      : "🔴 Saída Registrada"
                    : "🔒 Acesso Negado"}
                </h3>

                {resultadoAcesso.usuario && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-600" />
                      <span className="font-semibold text-slate-900">{resultadoAcesso.usuario.nome}</span>
                      <Badge variant="outline" className="capitalize">{resultadoAcesso.usuario.tipo}</Badge>
                    </div>
                    
                    {resultadoAcesso.reserva && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700">
                          {resultadoAcesso.reserva.disciplina} • {resultadoAcesso.reserva.horario}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {resultadoAcesso.motivo && (
                  <p className={`text-sm ${
                    resultadoAcesso.autorizado ? "text-green-700" : "text-red-700"
                  }`}>
                    {resultadoAcesso.motivo}
                  </p>
                )}

                {/* Equipamentos Controlados */}
                {resultadoAcesso.autorizado && resultadoAcesso.equipamentos_ativados && resultadoAcesso.equipamentos_ativados.length > 0 && (
                  <div className={`mt-4 p-4 bg-white rounded-lg border ${
                    resultadoAcesso.tipo_acesso === "entrada" 
                      ? "border-green-200" 
                      : "border-slate-300"
                  }`}>
                    <p className={`text-sm font-semibold mb-3 ${
                      resultadoAcesso.tipo_acesso === "entrada"
                        ? "text-green-900"
                        : "text-slate-700"
                    }`}>
                      {resultadoAcesso.tipo_acesso === "entrada" 
                        ? "🟢 Equipamentos Ligados" 
                        : "🔴 Equipamentos Desligados"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {salaEscolhida?.equipamentos
                        .filter(eq => resultadoAcesso.equipamentos_ativados?.includes(eq.relay_id || 0))
                        .map((eq) => {
                          const Icon = getEquipamentoIcon(eq.tipo)
                          const isEntrada = resultadoAcesso.tipo_acesso === "entrada"
                          return (
                            <div
                              key={eq.id}
                              className={`flex items-center gap-2 p-2 rounded-md border ${
                                isEntrada
                                  ? "bg-green-100 border-green-300"
                                  : "bg-slate-100 border-slate-300"
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${
                                isEntrada ? "text-green-700" : "text-slate-500"
                              }`} />
                              <div>
                                <p className={`text-xs font-medium ${
                                  isEntrada ? "text-green-900" : "text-slate-700"
                                }`}>
                                  {eq.nome}
                                </p>
                                <p className={`text-xs ${
                                  isEntrada ? "text-green-700" : "text-slate-500"
                                }`}>
                                  Relay {eq.relay_id} {isEntrada ? "ON" : "OFF"}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Histórico de Acessos */}
        {historicoAcessos.length > 0 && (
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="font-bold text-[#006241] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Histórico de Acessos ({historicoAcessos.length})
            </h3>
            <div className="space-y-2">
              {historicoAcessos.map((acesso, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    acesso.autorizado
                      ? acesso.tipo_acesso === "entrada"
                        ? "bg-green-50 border-green-200"
                        : "bg-blue-50 border-blue-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {acesso.autorizado ? (
                      <CheckCircle2 className={`w-5 h-5 ${
                        acesso.tipo_acesso === "entrada" ? "text-green-600" : "text-blue-600"
                      }`} />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${
                        acesso.autorizado
                          ? acesso.tipo_acesso === "entrada"
                            ? "text-green-900"
                            : "text-blue-900"
                          : "text-red-900"
                      }`}>
                        {acesso.autorizado
                          ? acesso.tipo_acesso === "entrada"
                            ? "🟢 Entrada"
                            : "🔴 Saída"
                          : "❌ Negado"}
                      </p>
                      <p className="text-xs text-slate-600">
                        {acesso.usuario?.nome || "Cartão não identificado"} • {acesso.timestamp.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {acesso.autorizado && acesso.equipamentos_ativados && (
                    <Badge variant="outline" className="text-xs">
                      {acesso.equipamentos_ativados.length} relay{acesso.equipamentos_ativados.length > 1 ? 's' : ''} {acesso.acao_equipamentos}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instruções */}
        <Card className="p-6 bg-gradient-to-br from-[#f0f7f4] to-white border-2 border-[#006241]/20">
          <h3 className="font-bold text-[#006241] mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Como Funciona - Sistema de Toggle Automático
          </h3>
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-[#006241] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Selecione a sala que deseja simular</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-[#006241] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Clique em "Iniciar Leitura Contínua"</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span><strong>Primeira passada:</strong> Sistema registra ENTRADA e LIGA equipamentos 🟢</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span><strong>Segunda passada:</strong> Sistema registra SAÍDA e DESLIGA equipamentos 🔴</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <span><strong>Terceira passada:</strong> Sistema registra ENTRADA e LIGA equipamentos 🟢 novamente</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-[#FFD700] text-[#006241] rounded-full flex items-center justify-center text-xs font-bold">∞</span>
              <span><strong>Continue passando cartões</strong> - O resultado limpa automaticamente após 4s. 
              Aguarde 2.5s entre leituras e o sistema continua processando infinitamente!</span>
            </li>
          </ol>

          <div className="mt-4 space-y-2">
            <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-xs text-green-900">
                <strong>🟢 Modo Contínuo Ativo:</strong> Após iniciar, basta passar o cartão. 
                Resultado aparece por 4s e limpa automaticamente para a próxima leitura!
              </p>
            </div>
            <div className="p-3 bg-[#fffbf0] border-2 border-[#FFD700]/50 rounded-lg">
              <p className="text-xs text-[#006241]">
                <strong>⏱️ Intervalo Inteligente:</strong> Sistema aguarda 2.5 segundos entre leituras para evitar 
                processamento duplicado. Remova e aproxime o cartão novamente para nova ação!
              </p>
            </div>
            <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-xs text-red-900">
                <strong>🔒 Acesso Negado?</strong> O sistema continua ativo! Mensagem orienta você a:
                entrar no portal do usuário e fazer uma reserva, ou realizar cadastro no totem.
              </p>
            </div>
            <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>📊 Dashboard Tempo Real:</strong> Cada equipamento gera leitura individual. 
                Acesse /admin-faculdade/alertas para ver gráficos atualizando automaticamente!
              </p>
            </div>
          </div>
        </Card>
      </div>
   
  )
}

