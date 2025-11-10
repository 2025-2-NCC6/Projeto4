"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Search,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Projector,
  Wind,
  Wifi,
  Monitor,
  Speaker,
  Thermometer,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SalaDialog } from "@/components/admin/sala-dialog"
import { SalaDetalhesDialog } from "@/components/admin/sala-detalhes-dialog"
import { AdminLayout } from "@/components/layout/admin-layout"

type Equipamento = {
  id: number
  tipo: "luz" | "projetor" | "ar_condicionado" | "computador" | "audio" | "rede"
  nome: string
  status: "ativo" | "inativo" | "manutencao"
  identificador?: string
  relay_id?: number | null
}

type Sala = {
  id: number
  nome: string
  tipo: string
  predio: string
  ativo: boolean
  patrocinada: boolean
  empresa_patrocinadora: string | null
  capacidade: number
  andar?: number
  area_m2?: number
    observacoes?: string
  equipamentos: Equipamento[]
}

export default function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [filteredSalas, setFilteredSalas] = useState<Sala[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTab, setFilterTab] = useState<"todas" | "blocoA" | "blocoB" | "blocoC" | "parcerias">("todas")
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativas" | "inativas" | "manutencao">("todos")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSalas()
  }, [])

  useEffect(() => {
    filterSalas()
  }, [searchTerm, filterTab, statusFilter, salas])

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
      setIsLoading(false)
    }
  }

  const filterSalas = () => {
    let filtered = salas

    // Filtro por bloco/categoria
    if (filterTab === "blocoA") {
      filtered = filtered.filter(s => s.predio === "A")
    } else if (filterTab === "blocoB") {
      filtered = filtered.filter(s => s.predio === "B")
    } else if (filterTab === "blocoC") {
      filtered = filtered.filter(s => s.predio === "C")
    } else if (filterTab === "parcerias") {
      filtered = filtered.filter(s => s.patrocinada === true)
    }

    // Filtro por status (ativo/inativo/manutenção)
    if (statusFilter === "ativas") {
      filtered = filtered.filter(s => s.ativo === true)
    } else if (statusFilter === "inativas") {
      filtered = filtered.filter(s => s.ativo === false)
    }

    // Busca por nome, prédio ou tipo
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.nome.toLowerCase().includes(term) ||
        s.predio.toLowerCase().includes(term) ||
        getTipoLabel(s.tipo).toLowerCase().includes(term)
      )
    }

    setFilteredSalas(filtered)
  }

  const handleToggleStatus = async (salaId: number) => {
    try {
      const sala = salas.find(s => s.id === salaId)
      if (!sala) return

      const response = await fetch(`/api/salas/${salaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ativo: !sala.ativo,
        }),
      })

      if (response.ok) {
        // Atualizar localmente
        setSalas(prev => prev.map(s => 
          s.id === salaId ? { ...s, ativo: !s.ativo } : s
        ))
      } else {
        alert("Erro ao atualizar status da sala")
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      alert("Erro ao alterar status da sala")
    }
  }

  const handleDeleteSala = async (salaId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.")) return
    
    try {
      const response = await fetch(`/api/salas/${salaId}`, { 
        method: "DELETE" 
      })

      if (response.ok) {
        setSalas(prev => prev.filter(s => s.id !== salaId))
      } else {
        alert("Erro ao excluir sala")
      }
    } catch (error) {
      console.error("Erro ao excluir sala:", error)
      alert("Erro ao excluir sala")
    }
  }

  const getEquipamentoIcon = (tipo: string) => {
    const icons = {
      luz: Lightbulb,
      projetor: Projector,
      ar_condicionado: Wind,
      sensor: Thermometer,
      audio: Speaker,
      rede: Wifi,
    }
    return icons[tipo as keyof typeof icons] || Monitor
  }

  return (
    <AdminLayout title="Gestão de Salas">
      <div className="space-y-4 lg:space-y-6 w-full">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 truncate">
              Gestão de Salas
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
              Administre prédios, salas, tipos, capacidade e equipamentos
            </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <SalaDialog onSave={(data) => {
              console.log("Nova sala:", data)
              fetchSalas()
            }} />
          </div>
        </div>

        {/* Layout com Sidebar de Blocos */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full min-w-0">
          {/* Sidebar de Blocos */}
          <Card className="w-full lg:w-64 flex-shrink-0 h-fit p-4 bg-white border-slate-200 lg:sticky lg:top-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#132B1E]" />
              Blocos
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              <button
                onClick={() => setFilterTab("todas")}
                className={`w-full text-left px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all text-sm lg:text-base ${
                  filterTab === "todas"
                    ? "bg-[#132B1E] text-[#B39C66] font-semibold shadow-md"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                📋 Todas
              </button>
              <button
                onClick={() => setFilterTab("blocoA")}
                className={`w-full text-left px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all text-sm lg:text-base ${
                  filterTab === "blocoA"
                    ? "bg-[#132B1E] text-[#B39C66] font-semibold shadow-md"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                🏢 Bloco A
              </button>
              <button
                onClick={() => setFilterTab("blocoB")}
                className={`w-full text-left px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all text-sm lg:text-base ${
                  filterTab === "blocoB"
                    ? "bg-[#132B1E] text-[#B39C66] font-semibold shadow-md"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                🏢 Bloco B
              </button>
              <button
                onClick={() => setFilterTab("blocoC")}
                className={`w-full text-left px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all text-sm lg:text-base ${
                  filterTab === "blocoC"
                    ? "bg-[#132B1E] text-[#B39C66] font-semibold shadow-md"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                🏢 Bloco C
              </button>
              <button
                onClick={() => setFilterTab("parcerias")}
                className={`w-full text-left px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-all text-sm lg:text-base ${
                  filterTab === "parcerias"
                    ? "bg-[#132B1E] text-[#B39C66] font-semibold shadow-md"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                🤝 Parcerias
              </button>
                            </div>

            {/* Estatísticas do Bloco */}
            <div className="mt-4 lg:mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-3">Estatísticas</p>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:space-y-2 text-sm">
                <div className="flex flex-col lg:flex-row lg:justify-between items-center lg:items-start">
                  <span className="text-slate-600 text-xs lg:text-sm">Total</span>
                  <span className="font-bold text-slate-900 text-lg lg:text-base">{filteredSalas.length}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-between items-center lg:items-start">
                  <span className="text-green-600 text-xs lg:text-sm">Ativas</span>
                  <span className="font-bold text-green-600 text-lg lg:text-base">
                    {filteredSalas.filter(s => s.ativo).length}
                  </span>
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-between items-center lg:items-start">
                  <span className="text-slate-500 text-xs lg:text-sm">Inativas</span>
                  <span className="font-bold text-slate-500 text-lg lg:text-base">
                    {filteredSalas.filter(s => !s.ativo).length}
                  </span>
                </div>
              </div>
            </div>
            </Card>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                  placeholder="Buscar sala, prédio ou tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-[#132B1E] focus:ring-[#132B1E]/20 w-full"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-48 flex-shrink-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="ativas">✅ Ativas</SelectItem>
                  <SelectItem value="inativas">⛔ Inativas</SelectItem>
                </SelectContent>
              </Select>
                      </div>
                      
            {/* Lista de Salas (Tabela) */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sala</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Localização</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Capacidade</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Equipamentos</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredSalas.map((sala) => {
                      return (
                        <tr key={sala.id} className={`hover:bg-slate-50 transition-colors ${
                          !sala.ativo && "opacity-60"
                        }`}>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">{sala.nome}</p>
                              {sala.patrocinada && (
                                <Badge variant="outline" className="mt-1 text-xs border-[#B39C66] text-[#B39C66]">
                                  🤝 {sala.empresa_patrocinadora || "Parceria"}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {getTipoLabel(sala.tipo)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Building2 className="w-4 h-4" />
                              <div>
                              <span>Prédio {sala.predio}</span>
                                {sala.andar && <span className="text-slate-400"> • {sala.andar}º andar</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-600" />
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{sala.capacidade} pessoas</p>
                                {sala.area_m2 && (
                                  <p className="text-xs text-slate-500">{sala.area_m2}m²</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {sala.ativo ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Ativa
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-slate-400 text-slate-600">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inativa
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-[#132B1E]" />
                                <div>
                                  <p className="font-semibold text-slate-900">
                                  {sala.equipamentos.length} equipamento{sala.equipamentos.length !== 1 && "s"}
                                  </p>
                                {sala.equipamentos.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {sala.equipamentos.slice(0, 3).map((eq) => {
                                      const Icon = getEquipamentoIcon(eq.tipo)
                                      return (
                                        <div
                                          key={eq.id}
                                          className={`p-1 rounded ${
                                            eq.status === "ativo" ? "bg-green-100" : "bg-slate-200"
                                          }`}
                                        >
                                          <Icon className="w-3 h-3" />
                                        </div>
                                      )
                                    })}
                                    {sala.equipamentos.length > 3 && (
                                      <span className="text-xs text-slate-500 ml-1">
                                        +{sala.equipamentos.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              </div>
                        </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <SalaDetalhesDialog sala={sala} />
                              <SalaDialog 
                                sala={sala} 
                                onSave={(data) => {
                                  console.log("Sala atualizada:", data)
                                  fetchSalas()
                                }} 
                              />
                              <Button
                                size="sm"
                                variant={sala.ativo ? "outline" : "default"}
                                onClick={() => handleToggleStatus(sala.id)}
                                className={sala.ativo ? "" : "bg-green-600 hover:bg-green-700 text-white"}
                              >
                                {sala.ativo ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSala(sala.id)}
                                className="text-red-600 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginação (para muitas salas) */}
              {filteredSalas.length > 20 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Mostrando {filteredSalas.length} sala(s)
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Anterior</Button>
                    <Button size="sm" variant="outline">Próxima</Button>
                  </div>
                </div>
              )}
            </div>

          {/* Empty State */}
          {filteredSalas.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma sala encontrada</h3>
              <p className="text-slate-600">Tente ajustar os filtros ou criar uma nova sala</p>
            </div>
          )}
            </div>
              </div>
      </div>
    </AdminLayout>
  )
}

function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    aula: "Sala de Aula",
    lab_info: "Lab. Informática",
    lab_make: "Lab. Maker",
    meet: "Sala de Reunião",
    teatro: "Auditório",
  }
  return labels[tipo] || tipo
}
