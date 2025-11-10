"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Plus,
  Search,
  Download,
  Clock,
  Users,
  TrendingUp,
  Grid3x3,
  BarChart3,
  CalendarDays,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminLayout } from "@/components/layout/admin-layout"
import { ReservaDialog } from "@/components/admin/reserva-dialog"
import { GradeSemanal } from "@/components/admin/grade-semanal"
import { CalendarioReservas } from "@/components/admin/calendario-reservas"
import { ListaReservas } from "@/components/admin/lista-reservas"

type Reserva = {
  id: number
  sala_id: number
  sala_nome: string
  predio: string
  usuario_id: number
  professor: string
  tipo: "fixa" | "temporaria" | "evento"
  dia_semana?: string
  hora_inicio: string
  hora_fim: string
  data_inicio?: string
  data_fim?: string
  curso?: string
  disciplina?: string
  turma?: string
  categoria: "aula" | "reuniao" | "evento" | "manutencao"
  status: "ativa" | "cancelada" | "encerrada"
  observacao?: string
}

export default function PlanejamentoReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSala, setFilterSala] = useState<string>("todas")
  const [filterPredio, setFilterPredio] = useState<string>("todos")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"calendario" | "grade" | "lista">("grade")

  useEffect(() => {
    fetchReservas()
  }, [])

  useEffect(() => {
    filterReservas()
  }, [searchTerm, filterSala, filterPredio, filterTipo, reservas])

  const fetchReservas = async () => {
    try {
      const response = await fetch("/api/reservas")
      const result = await response.json()
      
      if (result.success) {
        setReservas(result.data)
      }
    } catch (error) {
      console.error("Erro ao carregar reservas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterReservas = () => {
    let filtered = reservas.filter(r => r.status === "ativa")

    if (filterPredio !== "todos") {
      filtered = filtered.filter(r => r.predio === filterPredio)
    }

    if (filterTipo !== "todos") {
      filtered = filtered.filter(r => r.tipo === filterTipo)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.sala_nome.toLowerCase().includes(term) ||
        r.professor.toLowerCase().includes(term) ||
        r.disciplina?.toLowerCase().includes(term) ||
        r.curso?.toLowerCase().includes(term)
      )
    }

    setFilteredReservas(filtered)
  }

  // Estatísticas
  const stats = {
    total: reservas.filter(r => r.status === "ativa").length,
    hoje: reservas.filter(r => {
      // Simular reservas de hoje (em produção, filtrar por data atual)
      return r.status === "ativa"
    }).length,
    fixas: reservas.filter(r => r.tipo === "fixa" && r.status === "ativa").length,
    eventos: reservas.filter(r => r.tipo === "evento" && r.status === "ativa").length,
  }

  // Calcular ocupação semanal
  const calcularOcupacaoSemanal = () => {
    // Lógica simplificada - em produção, calcular baseado em horários reais
    const horasTotaisDisponiveis = 60 // 5 dias x 12 horas/dia (exemplo)
    const horasOcupadas = reservas.filter(r => r.status === "ativa").length * 2 // Média 2h por reserva
    return Math.round((horasOcupadas / horasTotaisDisponiveis) * 100)
  }

  const ocupacaoSemanal = calcularOcupacaoSemanal()

  return (
    <AdminLayout title="Planejamento e Reservas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Planejamento e Reservas</h1>
            <p className="text-slate-600 mt-2">Gerencie reservas, horários e ocupação das salas</p>
          </div>
          <ReservaDialog onSave={() => fetchReservas()} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Hoje</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.hoje}</p>
                <p className="text-xs text-slate-500 mt-1">reservas ativas</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 border-0 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Ocupação Semanal</p>
                <p className="text-3xl font-bold text-white mt-2">{ocupacaoSemanal}%</p>
                <p className="text-xs text-green-100 mt-1">da capacidade</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 border-0 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">Reservas Fixas</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.fixas}</p>
                <p className="text-xs text-purple-100 mt-1">recorrentes</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#132B1E] to-[#1a3d2b] border-0 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#B39C66]">Eventos</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.eventos}</p>
                <p className="text-xs text-slate-200 mt-1">pontuais</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros e Tabs */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            {/* Busca */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar por sala, professor, disciplina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-[#132B1E] focus:ring-[#132B1E]/20"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-3 w-full lg:w-auto">
              <Select value={filterPredio} onValueChange={setFilterPredio}>
                <SelectTrigger className="w-full lg:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Prédios</SelectItem>
                  <SelectItem value="A">Prédio A</SelectItem>
                  <SelectItem value="B">Prédio B</SelectItem>
                  <SelectItem value="C">Prédio C</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="fixa">🔁 Fixas</SelectItem>
                  <SelectItem value="temporaria">📅 Temporárias</SelectItem>
                  <SelectItem value="evento">🎯 Eventos</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">Exportar</span>
              </Button>
            </div>
          </div>

          {/* Tabs de Visualização */}
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full lg:w-auto">
              <TabsTrigger value="grade" className="gap-2 data-[state=active]:bg-[#132B1E] data-[state=active]:text-[#B39C66]">
                <Grid3x3 className="w-4 h-4" />
                Grade Semanal
              </TabsTrigger>
              <TabsTrigger value="calendario" className="gap-2 data-[state=active]:bg-[#132B1E] data-[state=active]:text-[#B39C66]">
                <CalendarDays className="w-4 h-4" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="lista" className="gap-2 data-[state=active]:bg-[#132B1E] data-[state=active]:text-[#B39C66]">
                <BarChart3 className="w-4 h-4" />
                Lista
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grade" className="mt-6">
              <GradeSemanal reservas={filteredReservas} onReservaClick={(reserva) => console.log(reserva)} />
            </TabsContent>

            <TabsContent value="calendario" className="mt-6">
              <CalendarioReservas reservas={filteredReservas} onReservaClick={(reserva) => console.log(reserva)} />
            </TabsContent>

            <TabsContent value="lista" className="mt-6">
              <ListaReservas reservas={filteredReservas} onReservaDeleted={fetchReservas} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Próximas Reservas - Sidebar Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#132B1E]" />
                Próximas Reservas
              </h3>
              <div className="space-y-3">
                {filteredReservas.slice(0, 5).map((reserva) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#132B1E] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {reserva.sala_nome}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-900">{reserva.professor}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {reserva.disciplina || reserva.categoria} • {reserva.hora_inicio} - {reserva.hora_fim}
                      </p>
                    </div>
                    <Badge className={
                      reserva.tipo === "fixa" ? "bg-purple-500" :
                      reserva.tipo === "evento" ? "bg-green-500" :
                      "bg-blue-500"
                    }>
                      {reserva.tipo}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-gradient-to-br from-slate-50 to-white border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Resumo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total de Reservas</span>
                <span className="text-2xl font-bold text-[#132B1E]">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Ocupação Semanal</span>
                <span className="text-2xl font-bold text-green-600">{ocupacaoSemanal}%</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Por Tipo</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Fixas (Recorrentes)</span>
                    <span className="font-semibold">{stats.fixas}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Eventos Pontuais</span>
                    <span className="font-semibold">{stats.eventos}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

