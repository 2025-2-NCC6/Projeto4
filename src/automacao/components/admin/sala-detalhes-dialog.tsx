"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Eye, 
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
  MapPin,
  Square,
  FileText,
} from "lucide-react"

type Equipamento = {
  id: number
  tipo: "luz" | "projetor" | "ar_condicionado" | "computador" | "audio" | "rede"
  nome: string
  status: "ativo" | "inativo" | "manutencao"
  identificador?: string
  relay_id?: number | null
}

interface Sala {
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

export function SalaDetalhesDialog({ sala }: { sala: Sala }) {
  const [open, setOpen] = useState(false)

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      aula: "Sala de Aula",
      lab_info: "Lab. Informática",
      lab_make: "Lab. Maker",
      meet: "Sala de Reunião",
      teatro: "Auditório",
    }
    return labels[tipo] || tipo
  }

  const getEquipamentoIcon = (tipo: string) => {
    const icons = {
      luz: Lightbulb,
      projetor: Projector,
      ar_condicionado: Wind,
      computador: Monitor,
      audio: Speaker,
      rede: Wifi,
    }
    return icons[tipo as keyof typeof icons] || Monitor
  }

  const getStatusEquipamento = (status: string) => {
    const configs = {
      ativo: { label: "Ativo", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" },
      inativo: { label: "Inativo", color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-50" },
      manutencao: { label: "Manutenção", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
    }
    return configs[status as keyof typeof configs] || configs.ativo
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 hover:bg-[#132B1E] hover:text-[#B39C66] hover:border-[#132B1E]"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {sala.nome}
            {sala.ativo ? (
              <Badge className="bg-green-500 text-white">Ativa</Badge>
            ) : (
              <Badge variant="outline" className="border-slate-400 text-slate-600">Inativa</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {getTipoLabel(sala.tipo)} • Prédio {sala.predio}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-2 gap-4">
            {/* Localização */}
            <Card className="p-4 bg-gradient-to-br from-slate-50 to-white border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#132B1E] rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#B39C66]" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Localização</p>
                  <p className="font-bold text-slate-900">Prédio {sala.predio}</p>
                </div>
              </div>
              {sala.andar && (
                <p className="text-sm text-slate-600">📍 {sala.andar}º andar</p>
              )}
            </Card>

            {/* Capacidade */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Capacidade</p>
                  <p className="font-bold text-slate-900">{sala.capacidade} pessoas</p>
                </div>
              </div>
            </Card>

            {/* Área */}
            {sala.area_m2 && (
              <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Square className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Área</p>
                    <p className="font-bold text-slate-900">{sala.area_m2} m²</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Parceria */}
            {sala.patrocinada && (
              <Card className="p-4 bg-gradient-to-br from-[#B39C66]/10 to-white border-[#B39C66]/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B39C66] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Parceria</p>
                    <p className="font-bold text-slate-900 text-sm">
                      {sala.empresa_patrocinadora || "Patrocinada"}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Observações */}
          {sala.observacoes && (
            <Card className="p-4 border-slate-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Observações</h4>
                  <p className="text-sm text-slate-600">{sala.observacoes}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Equipamentos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Equipamentos</h3>
                <p className="text-sm text-slate-600">
                  {sala.equipamentos.length === 0 && "Nenhum equipamento cadastrado"}
                  {sala.equipamentos.length === 1 && "1 equipamento cadastrado"}
                  {sala.equipamentos.length > 1 && `${sala.equipamentos.length} equipamentos cadastrados`}
                </p>
              </div>
            </div>

            {sala.equipamentos.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <div className="space-y-2">
                  <Monitor className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-slate-500 font-medium">Sala sem equipamentos</p>
                  <p className="text-sm text-slate-400">
                    Edite a sala para adicionar equipamentos
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sala.equipamentos.map((eq) => {
                  const Icon = getEquipamentoIcon(eq.tipo)
                  const statusConfig = getStatusEquipamento(eq.status)
                  
                  return (
                    <Card 
                      key={eq.id}
                      className="p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusConfig.bgColor}`}>
                            <Icon className={`w-6 h-6 ${statusConfig.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate">{eq.nome}</h4>
                            <p className="text-xs text-slate-500 capitalize mb-2">
                              {eq.tipo.replace("_", " ")}
                            </p>
                            {eq.identificador && (
                              <Badge variant="outline" className="text-xs">
                                ID: {eq.identificador}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${statusConfig.textColor} ${statusConfig.bgColor} border-${statusConfig.color.replace("bg-", "")}`}
                        >
                          {eq.status === "ativo" ? <CheckCircle2 className="w-3 h-3 mr-1 inline" /> : 
                           eq.status === "inativo" ? <XCircle className="w-3 h-3 mr-1 inline" /> : "⚠️ "}
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Resumo de Equipamentos */}
            {sala.equipamentos.length > 0 && (
              <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 mt-4">
                <h4 className="font-semibold text-slate-900 mb-3">📊 Resumo de Equipamentos</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#132B1E]">{sala.equipamentos.length}</p>
                    <p className="text-xs text-slate-600">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {sala.equipamentos.filter(eq => eq.status === "ativo").length}
                    </p>
                    <p className="text-xs text-slate-600">Ativos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {sala.equipamentos.filter(eq => eq.status === "manutencao").length}
                    </p>
                    <p className="text-xs text-slate-600">Manutenção</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

