"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  CalendarPlus, 
  Clock, 
  MapPin,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Activity
} from "lucide-react"
import { useUser } from "@/contexts/user-context"
import Link from "next/link"

interface ReservaAtiva {
  id: number
  sala_nome: string
  predio: string
  data: string
  horario_inicio: string
  horario_fim: string
  status: string
}

export default function UsuarioDashboardPage() {
  const { usuario } = useUser()
  const [reservasAtivas, setReservasAtivas] = useState<ReservaAtiva[]>([])
  const [stats, setStats] = useState({
    total_reservas: 0,
    reservas_ativas: 0,
    proxima_reserva: null as ReservaAtiva | null,
    problemas_reportados: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (usuario?.id) {
      fetchDashboardData()
    }
  }, [usuario])

  const fetchDashboardData = async () => {
    try {
      // Buscar reservas ativas do usuário
      const response = await fetch(`/api/usuarios/${usuario?.id}/reservas?status=ativa`)
      const data = await response.json()
      
      if (data.success) {
        setReservasAtivas(data.data)
        
        // Calcular stats
        const agora = new Date()
        const proximasReservas = data.data
          .filter((r: ReservaAtiva) => new Date(r.data + ' ' + r.horario_inicio) > agora)
          .sort((a: ReservaAtiva, b: ReservaAtiva) => 
            new Date(a.data + ' ' + a.horario_inicio).getTime() - 
            new Date(b.data + ' ' + b.horario_inicio).getTime()
          )
        
        setStats({
          total_reservas: data.data.length,
          reservas_ativas: data.data.length,
          proxima_reserva: proximasReservas[0] || null,
          problemas_reportados: 2 // Mock - implementar depois
        })
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
    } finally {
      setLoading(false)
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Olá, {usuario?.nome?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-600 mt-2">
          Bem-vindo à sua área de reservas e controle de salas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Reservas Ativas</p>
              <p className="text-3xl font-bold mt-2">{stats.reservas_ativas}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total de Reservas</p>
              <p className="text-3xl font-bold mt-2">{stats.total_reservas}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Problemas Abertos</p>
              <p className="text-3xl font-bold mt-2">{stats.problemas_reportados}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Status Geral</p>
              <p className="text-xl font-bold mt-2">Ativo</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </Card>
      </div>

      {/* Próxima Reserva */}
      {stats.proxima_reserva && (
        <Card className="p-6 border-2 border-[#B39C66] bg-gradient-to-br from-[#132B1E]/5 to-[#B39C66]/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#B39C66] rounded-lg">
              <Clock className="w-6 h-6 text-[#132B1E]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                📍 Próxima Reserva
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Sala</p>
                  <p className="font-semibold text-slate-900">
                    {stats.proxima_reserva.sala_nome} - {stats.proxima_reserva.predio}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Data e Horário</p>
                  <p className="font-semibold text-slate-900">
                    {formatarData(stats.proxima_reserva.data)} às {formatarHorario(stats.proxima_reserva.horario_inicio)}
                  </p>
                </div>
              </div>
            </div>
            <Link href="/usuario/minhas-reservas">
              <Button className="bg-[#132B1E] hover:bg-[#132B1E]/90 text-white">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/usuario/solicitar-reserva">
          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-[#B39C66] group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <CalendarPlus className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Nova Reserva</h3>
                <p className="text-slate-600 mt-1">Solicitar reserva de sala</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/usuario/minhas-reservas">
          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-[#B39C66] group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Minhas Reservas</h3>
                <p className="text-slate-600 mt-1">Gerenciar e controlar salas</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/usuario/problemas">
          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-[#B39C66] group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Reportar Problema</h3>
                <p className="text-slate-600 mt-1">Informar problemas na sala</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-8 bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-300 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Status</h3>
              <p className="text-slate-600 mt-1">Tudo funcionando</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reservas Recentes */}
      {reservasAtivas.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Reservas Ativas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservasAtivas.slice(0, 4).map((reserva) => (
              <Card key={reserva.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {reserva.sala_nome}
                    </h3>
                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {reserva.predio}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-600">Data</p>
                    <p className="font-semibold text-slate-900">
                      {formatarData(reserva.data)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Horário</p>
                    <p className="font-semibold text-slate-900">
                      {formatarHorario(reserva.horario_inicio)} - {formatarHorario(reserva.horario_fim)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

