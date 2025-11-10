"use client"

import { useState, useEffect } from "react"
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
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Building2,
  Users,
  Lightbulb,
  Projector,
  Wind,
  Wifi,
  Speaker,
  Monitor,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Sala = {
  id: number
  nome: string
  predio: string
  tipo: string
  capacidade: number
}

type AccessResult = {
  authorized: boolean
  message: string
  userName?: string
  roomName?: string
  equipamentos?: Array<{
    id: number
    nome: string
    tipo: string
    relay_id: number | null
  }>
  isEntrada?: boolean
  acao?: "ON" | "OFF"
}

interface RoomAccessScreenProps {
  onBack: () => void
}

export function RoomAccessScreen({ onBack }: RoomAccessScreenProps) {
  const [salas, setSalas] = useState<Sala[]>([])
  const [selectedSala, setSelectedSala] = useState<string>("")
  const [isLoadingSalas, setIsLoadingSalas] = useState(true)
  const [isWaitingCard, setIsWaitingCard] = useState(false)
  const [accessResult, setAccessResult] = useState<AccessResult | null>(null)
  const [rfidCard, setRfidCard] = useState<string>("")

  useEffect(() => {
    fetchSalas()
  }, [])

  useEffect(() => {
    if (isWaitingCard && selectedSala) {
      // Iniciar leitura RFID contínua
      const eventSource = new EventSource("/api/usuarios/aguardar-rfid")

      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === "card_read" && data.cardId) {
            setRfidCard(data.cardId)
            // NÃO fecha o eventSource - continua aguardando
            
            // Verificar acesso
            await checkAccess(data.cardId, parseInt(selectedSala))
          }
        } catch (error) {
          console.error("Erro ao processar leitura RFID:", error)
        }
      }

      eventSource.onerror = () => {
        console.error("Erro na conexão SSE")
        eventSource.close()
        setIsWaitingCard(false)
      }

      return () => {
        eventSource.close()
      }
    }
  }, [isWaitingCard, selectedSala])

  const fetchSalas = async () => {
    try {
      const response = await fetch("/api/salas")
      const result = await response.json()
      
      if (result.success) {
        setSalas(result.data)
      }
    } catch (error) {
      console.error("Erro ao carregar salas:", error)
    } finally {
      setIsLoadingSalas(false)
    }
  }

  const checkAccess = async (cardId: string, salaId: number) => {
    try {
      const response = await fetch("/api/acesso/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_uid: cardId, sala_id: salaId }),
      })

      const result = await response.json()

      // Verificar se foi autorizado
      if (result.autorizado) {
        // Buscar sala para pegar equipamentos
        const salaResponse = await fetch(`/api/salas`)
        const salasData = await salaResponse.json()
        const salaInfo = salasData.success ? salasData.data.find((s: any) => s.id === salaId) : null

        const isEntrada = result.tipo_acesso === "entrada"
        const acao = result.acao_equipamentos || "ON"

        setAccessResult({
          authorized: true,
          message: isEntrada ? "Acesso autorizado - Entrada" : "Acesso autorizado - Saída",
          userName: result.usuario?.nome,
          roomName: salaInfo?.nome || `Sala ${salaId}`,
          equipamentos: salaInfo?.equipamento || [],
          isEntrada: isEntrada,
          acao: acao,
        })

        // Se autorizado e há equipamentos, ativar/desativar relays
        const equipamentosComRelay = (salaInfo?.equipamento || []).filter((eq: any) => eq.relay_id !== null)
        if (equipamentosComRelay.length > 0) {
          await activateEquipment(salaId, equipamentosComRelay, acao)
        }

        // Auto-limpar resultado após 5 segundos e voltar para aguardar
        setTimeout(() => {
          setAccessResult(null)
          setRfidCard("")
        }, 5000)
      } else {
        setAccessResult({
          authorized: false,
          message: result.motivo || "Acesso negado",
        })

        // Auto-limpar erro após 5 segundos
        setTimeout(() => {
          setAccessResult(null)
          setRfidCard("")
        }, 5000)
      }
    } catch (error) {
      console.error("Erro ao verificar acesso:", error)
      setAccessResult({
        authorized: false,
        message: "Erro ao verificar acesso. Tente novamente.",
      })

      // Auto-limpar erro após 5 segundos
      setTimeout(() => {
        setAccessResult(null)
        setRfidCard("")
      }, 5000)
    }
    // Sistema continua aguardando próximas leituras automaticamente
  }

  const activateEquipment = async (salaId: number, equipamentos: any[], action: "ON" | "OFF" = "ON") => {
    try {
      const relayIds = equipamentos
        .filter(eq => eq.relay_id !== null)
        .map(eq => eq.relay_id)

      if (relayIds.length === 0) return

      console.log(`${action === "ON" ? "🟢 Ligando" : "🔴 Desligando"} equipamentos:`, relayIds)

      await fetch("/api/equipamentos/ativar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sala_id: salaId, 
          relay_ids: relayIds,
          action: action 
        }),
      })
    } catch (error) {
      console.error("Erro ao controlar equipamentos:", error)
    }
  }

  const handleStartAccess = () => {
    if (!selectedSala) return
    setAccessResult(null)
    setRfidCard("")
    setIsWaitingCard(true)
  }

  const handleReset = () => {
    setAccessResult(null)
    setRfidCard("")
    // Mantém isWaitingCard ativo - continua lendo cartões
  }

  const getEquipmentIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      luz: Lightbulb,
      projetor: Projector,
      ar_condicionado: Wind,
      computador: Monitor,
      audio: Speaker,
      rede: Wifi,
    }
    return icons[tipo] || Monitor
  }

  const selectedSalaData = salas.find(s => s.id === parseInt(selectedSala))

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f0f7f4] via-white to-[#fffbf0] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006241] rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full blur-3xl opacity-10" />
      </div>
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-[#FFD700] border-2 shadow-2xl relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={accessResult ? handleReset : onBack}
              className="text-[#006241] hover:bg-[#006241]/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {accessResult ? "Nova Tentativa" : "Voltar"}
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#006241] to-[#00A86B] bg-clip-text text-transparent">Acesso a Salas</h1>
              <p className="text-slate-600 mt-1">Sistema de Controle de Acesso EnerSave</p>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          <AnimatePresence mode="wait">
            {!accessResult ? (
              <motion.div
                key="access-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Seleção de Sala */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Selecione a Sala
                  </label>
                  <Select value={selectedSala} onValueChange={setSelectedSala} disabled={isWaitingCard}>
                    <SelectTrigger className="h-14 text-lg border-2 border-slate-300 focus:border-[#006241] focus:ring-2 focus:ring-[#006241]/20">
                      <SelectValue placeholder="Escolha uma sala..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSalas ? (
                        <div className="p-4 text-center text-slate-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          <p className="mt-2 text-sm">Carregando salas...</p>
                        </div>
                      ) : (
                        salas.map((sala) => (
                          <SelectItem key={sala.id} value={sala.id.toString()}>
                            <div className="flex items-center gap-3">
                              <Building2 className="w-4 h-4 text-[#006241]" />
                              <span className="font-semibold">{sala.nome}</span>
                              <span className="text-slate-500">• Prédio {sala.predio}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Info da Sala Selecionada */}
                {selectedSalaData && !isWaitingCard && (
                  <Card className="p-4 bg-slate-50 border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#006241] to-[#00A86B] rounded-lg flex items-center justify-center shadow-md">
                          <Building2 className="w-6 h-6 text-[#FFD700]" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{selectedSalaData.nome}</p>
                          <p className="text-sm text-slate-600">Prédio {selectedSalaData.predio}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{selectedSalaData.capacidade} pessoas</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Card Reading Animation */}
                {isWaitingCard ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12"
                  >
                    <div className="flex flex-col items-center gap-6">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                          <CreditCard className="w-16 h-16 text-white" />
                        </div>
                      </motion.div>
                      
                      <div className="text-center">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#006241] to-[#00A86B] bg-clip-text text-transparent mb-2">
                          ✅ Leitor Ativo
                        </h3>
                        <p className="text-[#006241] font-semibold mb-1">
                          Aproxime seu cartão
                        </p>
                        <p className="text-sm text-slate-500">
                          Passe quantas vezes quiser - sistema alterna entrada/saída
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <motion.div
                          className="w-3 h-3 bg-green-500 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-3 h-3 bg-green-500 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-3 h-3 bg-green-500 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setIsWaitingCard(false)}
                        className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Parar Leitura
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <Button
                    onClick={handleStartAccess}
                    disabled={!selectedSala}
                    className="w-full h-14 text-lg bg-gradient-to-r from-[#006241] to-[#00A86B] hover:from-[#004d33] hover:to-[#008659] text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#006241]/30 transition-all"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Iniciar Leitura Contínua
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="access-result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-8"
              >
                <div className="flex flex-col items-center gap-6">
                  {accessResult.authorized ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-20 h-20 text-green-600" />
                        </div>
                      </motion.div>

                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-green-600 mb-2">
                          {accessResult.isEntrada ? "Acesso Autorizado!" : "Até Logo!"}
                        </h2>
                        {accessResult.userName && (
                          <p className="text-xl text-slate-700 mb-1">
                            {accessResult.isEntrada ? (
                              <>Bem-vindo(a), <span className="font-semibold">{accessResult.userName}</span></>
                            ) : (
                              <>Até breve, <span className="font-semibold">{accessResult.userName}</span></>
                            )}
                          </p>
                        )}
                        {accessResult.roomName && (
                          <p className="text-slate-600">{accessResult.roomName}</p>
                        )}
                      </div>

                      {accessResult.equipamentos && accessResult.equipamentos.length > 0 && (
                        <Card className={`w-full p-4 ${accessResult.isEntrada ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                          <p className={`text-sm font-semibold mb-3 text-center ${accessResult.isEntrada ? 'text-green-800' : 'text-slate-700'}`}>
                            {accessResult.isEntrada ? "🟢 Equipamentos Ligados" : "🔴 Equipamentos Desligados"}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {accessResult.equipamentos.map((eq) => {
                              const Icon = getEquipmentIcon(eq.tipo)
                              const isEntrada = accessResult.isEntrada
                              return (
                                <div
                                  key={eq.id}
                                  className={`flex items-center gap-2 bg-white p-2 rounded-lg border ${
                                    isEntrada ? 'border-green-200' : 'border-slate-200'
                                  }`}
                                >
                                  <Icon className={`w-4 h-4 ${isEntrada ? 'text-green-600' : 'text-slate-400'}`} />
                                  <span className="text-sm text-slate-700">{eq.nome}</span>
                                  {eq.relay_id && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                      R{eq.relay_id}
                                    </Badge>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </Card>
                      )}
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="w-20 h-20 text-red-600" />
                        </div>
                      </motion.div>

                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-red-600 mb-2">
                          Acesso Negado
                        </h2>
                        <p className="text-lg text-slate-700">
                          {accessResult.message}
                        </p>
                      </div>

                      <Card className="w-full p-4 bg-red-50 border-red-200">
                        <p className="text-sm text-red-800 text-center">
                          ℹ️ Se você acredita que deveria ter acesso, entre em contato com a administração.
                        </p>
                      </Card>
                    </>
                  )}

                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span>Sistema voltará a aguardar automaticamente em 5s...</span>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handleReset}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            ✅ Pronto - Aguardar Agora
                          </Button>
                          <Button
                            onClick={() => {
                              setIsWaitingCard(false)
                              setAccessResult(null)
                            }}
                            variant="outline"
                            className="flex-1 border-slate-300"
                          >
                            🏁 Finalizar
                          </Button>
                        </div>
                      </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}

