"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Clock, User, BookOpen, Building2 } from "lucide-react"

type Reserva = {
  id: number
  sala_id: number
  sala_nome: string
  predio: string
  professor: string
  tipo: "fixa" | "temporaria" | "evento"
  dia_semana?: string
  hora_inicio: string
  hora_fim: string
  curso?: string
  disciplina?: string
  turma?: string
  categoria: string
}

type GradeSemanalProps = {
  reservas: Reserva[]
  onReservaClick: (reserva: Reserva) => void
}

export function GradeSemanal({ reservas, onReservaClick }: GradeSemanalProps) {
  const [selectedSala, setSelectedSala] = useState<string>("todas")
  const [selectedPredio, setSelectedPredio] = useState<string>("todos")

  const diasSemana = ["seg", "ter", "qua", "qui", "sex", "sab"]
  const diasLabels = {
    seg: "Segunda",
    ter: "Terça",
    qua: "Quarta",
    qui: "Quinta",
    sex: "Sexta",
    sab: "Sábado",
  }

  // Horários das 7h às 23h
  const horarios = Array.from({ length: 16 }, (_, i) => {
    const hora = 7 + i
    return `${hora.toString().padStart(2, "0")}:00`
  })

  // Filtrar reservas
  const reservasFiltradas = reservas.filter(r => {
    if (selectedPredio !== "todos" && r.predio !== selectedPredio) return false
    if (selectedSala !== "todas" && r.sala_id.toString() !== selectedSala) return false
    return r.tipo === "fixa" // Mostrar apenas fixas na grade
  })

  // Obter lista única de salas
  const salasUnicas = Array.from(new Set(reservas.map(r => r.sala_nome)))
    .sort()

  // Agrupar reservas por dia e horário
  const getReservaParaHorario = (dia: string, horario: string) => {
    return reservasFiltradas.filter(r => {
      if (r.dia_semana !== dia) return false
      
      // Verificar se o horário da reserva inclui este horário
      const horaReservaInicio = parseInt(r.hora_inicio.split(":")[0])
      const horaReservaFim = parseInt(r.hora_fim.split(":")[0])
      const horaAtual = parseInt(horario.split(":")[0])
      
      return horaAtual >= horaReservaInicio && horaAtual < horaReservaFim
    })
  }

  // Calcular rowspan para reservas que ocupam múltiplas horas
  const calculateRowSpan = (reserva: Reserva) => {
    const inicio = parseInt(reserva.hora_inicio.split(":")[0])
    const fim = parseInt(reserva.hora_fim.split(":")[0])
    return fim - inicio
  }

  // Verificar se uma célula deve ser renderizada (não está coberta por rowspan)
  const shouldRenderCell = (dia: string, horario: string) => {
    const horaAtual = parseInt(horario.split(":")[0])
    
    for (const reserva of reservasFiltradas) {
      if (reserva.dia_semana !== dia) continue
      
      const horaInicio = parseInt(reserva.hora_inicio.split(":")[0])
      const horaFim = parseInt(reserva.hora_fim.split(":")[0])
      
      // Se está dentro de uma reserva mas não é o início
      if (horaAtual > horaInicio && horaAtual < horaFim) {
        return false
      }
    }
    return true
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3">
        <Select value={selectedPredio} onValueChange={setSelectedPredio}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Prédios</SelectItem>
            <SelectItem value="A">📍 Prédio A</SelectItem>
            <SelectItem value="B">📍 Prédio B</SelectItem>
            <SelectItem value="C">📍 Prédio C</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSala} onValueChange={setSelectedSala}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Salas</SelectItem>
            {salasUnicas.map(sala => (
              <SelectItem key={sala} value={sala}>
                {sala}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grade */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#132B1E]">
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#B39C66] border-r border-slate-700 sticky left-0 bg-[#132B1E] z-10">
                  Horário
                </th>
                {diasSemana.map(dia => (
                  <th
                    key={dia}
                    className="px-4 py-3 text-center text-sm font-semibold text-[#B39C66] border-r border-slate-700 min-w-[200px]"
                  >
                    {diasLabels[dia as keyof typeof diasLabels]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario, hIdx) => (
                <tr key={horario} className={hIdx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                  <td className="px-4 py-2 text-sm font-medium text-slate-700 border-r border-b border-slate-200 sticky left-0 bg-slate-100 z-10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {horario}
                    </div>
                  </td>
                  {diasSemana.map(dia => {
                    if (!shouldRenderCell(dia, horario)) {
                      return null
                    }

                    const reservasHorario = getReservaParaHorario(dia, horario)
                    const primeiraReserva = reservasHorario.find(r => r.hora_inicio.startsWith(horario.split(":")[0]))

                    if (primeiraReserva) {
                      const rowSpan = calculateRowSpan(primeiraReserva)
                      
                      return (
                        <td
                          key={`${dia}-${horario}`}
                          rowSpan={rowSpan}
                          className="border-r border-b border-slate-200 p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => onReservaClick(primeiraReserva)}
                        >
                          <div className={`p-3 rounded-lg border-l-4 ${
                            primeiraReserva.categoria === "aula" ? "bg-blue-50 border-blue-500" :
                            primeiraReserva.categoria === "reuniao" ? "bg-purple-50 border-purple-500" :
                            primeiraReserva.categoria === "evento" ? "bg-green-50 border-green-500" :
                            "bg-orange-50 border-orange-500"
                          }`}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3 h-3 text-slate-600" />
                                <span className="text-xs font-semibold text-slate-900">
                                  {primeiraReserva.sala_nome}
                                </span>
                              </div>
                              
                              {primeiraReserva.disciplina && (
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3 text-slate-500" />
                                  <p className="text-xs font-medium text-slate-800 truncate">
                                    {primeiraReserva.disciplina}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-500" />
                                <p className="text-xs text-slate-600 truncate">
                                  {primeiraReserva.professor}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {primeiraReserva.hora_inicio} - {primeiraReserva.hora_fim}
                              </div>

                              {primeiraReserva.turma && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {primeiraReserva.turma}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                      )
                    }

                    return (
                      <td
                        key={`${dia}-${horario}`}
                        className="border-r border-b border-slate-200 p-2 text-center"
                      >
                        <span className="text-xs text-slate-400">—</span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda */}
      <Card className="p-4 bg-slate-50">
        <p className="text-sm font-semibold text-slate-900 mb-2">Legenda</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-xs text-slate-600">Aula</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded" />
            <span className="text-xs text-slate-600">Reunião</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-xs text-slate-600">Evento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" />
            <span className="text-xs text-slate-600">Manutenção</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

