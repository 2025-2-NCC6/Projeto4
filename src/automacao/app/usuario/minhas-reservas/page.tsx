"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Clock,
  MapPin,
  Wind,
  Power,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Reserva {
  id: number
  sala_id: number
  sala_nome: string
  predio: string
  data: string
  horario_inicio: string
  horario_fim: string
  status: string
  tipo_reserva: string
  ar_condicionado_ligado?: boolean
  temperatura_atual?: number
  equipamentos: {
    id: number
    tipo: string
    relay_id: number
  }[]
}

export default function MinhasReservasPage() {
  const { usuario } = useUser()
  const { toast } = useToast()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [controllingAr, setControllingAr] = useState<number | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [reservaToCancel, setReservaToCancel] = useState<number | null>(null)

  useEffect(() => {
    if (usuario?.id) {
      fetchReservas()
    }
  }, [usuario])

  const fetchReservas = async () => {
    try {
      const response = await fetch(`/api/usuarios/${usuario?.id}/reservas`)
      const data = await response.json()
      
      if (data.success) {
        setReservas(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar reservas:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar suas reservas.",
      })
    } finally {
      setLoading(false)
    }
  }

  const controlarArCondicionado = async (reservaId: number, ligar: boolean) => {
    setControllingAr(reservaId)
    try {
      const reserva = reservas.find(r => r.id === reservaId)
      if (!reserva) return

      const arEquipamento = reserva.equipamentos.find(e => e.tipo === "ar_condicionado")
      if (!arEquipamento) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Esta sala não possui ar-condicionado cadastrado.",
        })
        return
      }

      const response = await fetch("/api/equipamentos/ativar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sala_id: reserva.sala_id,
          relay_ids: [arEquipamento.relay_id],
          action: ligar ? "ON" : "OFF"
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Atualizar estado local
        setReservas(prev => prev.map(r => 
          r.id === reservaId 
            ? { ...r, ar_condicionado_ligado: ligar }
            : r
        ))

        toast({
          title: ligar ? "Ar-condicionado Ligado" : "Ar-condicionado Desligado",
          description: `${reserva.sala_nome} - ${reserva.predio}`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao controlar ar-condicionado",
        description: error.message || "Tente novamente.",
      })
    } finally {
      setControllingAr(null)
    }
  }

  const handleCancelClick = (reservaId: number) => {
    setReservaToCancel(reservaId)
    setShowCancelDialog(true)
  }

  const cancelarReserva = async () => {
    if (!reservaToCancel) return

    try {
      const response = await fetch(`/api/reservas/${reservaToCancel}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelada" }),
      })

      const data = await response.json()

      if (data.success) {
        setReservas(prev => prev.map(r => 
          r.id === reservaToCancel 
            ? { ...r, status: "cancelada" }
            : r
        ))

        toast({
          title: "Reserva Cancelada",
          description: "Sua reserva foi cancelada com sucesso.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cancelar reserva",
        description: error.message || "Tente novamente.",
      })
    } finally {
      setShowCancelDialog(false)
      setReservaToCancel(null)
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatarHorario = (hora: string) => {
    return hora.substring(0, 5)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
      case "confirmada":
        return "bg-green-100 text-green-700 border-green-300"
      case "pendente":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "cancelada":
        return "bg-red-100 text-red-700 border-red-300"
      default:
        return "bg-slate-100 text-slate-700 border-slate-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativa":
      case "confirmada":
        return <CheckCircle2 className="w-4 h-4" />
      case "pendente":
        return <Clock className="w-4 h-4" />
      case "cancelada":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // Aguardar carregamento do usuário
  if (!usuario || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#132B1E]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Minhas Reservas</h1>
          <p className="text-slate-600 mt-2">
            Gerencie suas reservas e controle o ar-condicionado
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Total de Reservas</p>
          <p className="text-3xl font-bold text-[#132B1E]">{reservas.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
          Todas ({reservas.length})
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
          Ativas ({reservas.filter(r => r.status === "ativa" || r.status === "confirmada").length})
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
          Pendentes ({reservas.filter(r => r.status === "pendente").length})
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
          Canceladas ({reservas.filter(r => r.status === "cancelada").length})
        </Badge>
      </div>

      {/* Lista de Reservas */}
      {reservas.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Nenhuma reserva encontrada
          </h3>
          <p className="text-slate-600 mb-6">
            Você ainda não possui reservas. Solicite uma nova reserva para começar.
          </p>
          <Button 
            className="bg-[#132B1E] hover:bg-[#132B1E]/90"
            onClick={() => window.location.href = "/usuario/solicitar-reserva"}
          >
            Solicitar Reserva
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reservas.map((reserva) => {
            const temArCondicionado = reserva.equipamentos.some(e => e.tipo === "ar_condicionado")
            const arLigado = reserva.ar_condicionado_ligado || false

            return (
              <Card key={reserva.id} className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Informações da Reserva */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {reserva.sala_nome}
                        </h3>
                        <p className="text-slate-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {reserva.predio}
                        </p>
                      </div>
                      <Badge className={getStatusColor(reserva.status)}>
                        {getStatusIcon(reserva.status)}
                        <span className="ml-1 capitalize">{reserva.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-600" />
                        <div>
                          <p className="text-xs text-slate-600">Data</p>
                          <p className="font-semibold text-slate-900">
                            {formatarData(reserva.data)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Clock className="w-5 h-5 text-slate-600" />
                        <div>
                          <p className="text-xs text-slate-600">Horário</p>
                          <p className="font-semibold text-slate-900">
                            {formatarHorario(reserva.horario_inicio)} - {formatarHorario(reserva.horario_fim)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Badge variant="outline" className="text-xs">
                        {reserva.tipo_reserva === "temporaria" ? "Reserva Única" : "Reserva Fixa"}
                      </Badge>
                      {reserva.equipamentos.length > 0 && (
                        <span className="text-xs">
                          • {reserva.equipamentos.length} equipamento(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="lg:w-80 space-y-4">
                    {/* Controle de Ar-Condicionado */}
                    {temArCondicionado && (reserva.status === "ativa" || reserva.status === "confirmada") && (
                      <Card className={`p-4 border-2 transition-all ${
                        arLigado 
                          ? "border-blue-300 bg-blue-50" 
                          : "border-slate-200 bg-slate-50"
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Wind className={`w-5 h-5 ${arLigado ? "text-blue-600" : "text-slate-600"}`} />
                            <span className="font-semibold text-sm">
                              Ar-Condicionado
                            </span>
                          </div>
                          <Badge className={arLigado ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}>
                            {arLigado ? "Ligado" : "Desligado"}
                          </Badge>
                        </div>

                        {reserva.temperatura_atual && (
                          <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                            <Thermometer className="w-4 h-4" />
                            <span>{reserva.temperatura_atual}°C</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => controlarArCondicionado(reserva.id, true)}
                            disabled={arLigado || controllingAr === reserva.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            {controllingAr === reserva.id ? (
                              "Processando..."
                            ) : (
                              <>
                                <Power className="w-4 h-4 mr-1" />
                                Ligar
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => controlarArCondicionado(reserva.id, false)}
                            disabled={!arLigado || controllingAr === reserva.id}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            {controllingAr === reserva.id ? (
                              "Processando..."
                            ) : (
                              <>
                                <Power className="w-4 h-4 mr-1" />
                                Desligar
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    )}

                    {/* Ações */}
                    <div className="space-y-2">
                      {(reserva.status === "ativa" || reserva.status === "confirmada") && (
                        <Button
                          onClick={() => handleCancelClick(reserva.id)}
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-50"
                          size="sm"
                        >
                          Cancelar Reserva
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false)
          setReservaToCancel(null)
        }}
        onConfirm={cancelarReserva}
        title="Cancelar Reserva"
        description="Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita."
        confirmText="Sim, Cancelar"
        cancelText="Não, Manter"
      />
    </div>
  )
}

