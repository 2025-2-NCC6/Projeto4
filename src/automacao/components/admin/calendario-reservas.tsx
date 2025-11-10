"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, User, Building2, X, Edit } from "lucide-react"
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, addDays, setHours, setMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const locales = {
  "pt-BR": ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
})

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
  data_inicio?: string
  data_fim?: string
}

type CalendarioReservasProps = {
  reservas: Reserva[]
  onReservaClick: (reserva: Reserva) => void
}

export function CalendarioReservas({ reservas, onReservaClick }: CalendarioReservasProps) {
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>("week")

  // Converter reservas para eventos do calendário
  const eventos = reservas.flatMap((reserva) => {
    if (reserva.tipo === "fixa") {
      // Para fixas, criar eventos para as próximas 4 semanas
      const diasMap: Record<string, number> = {
        seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
      }
      
      const diaSemana = reserva.dia_semana ? diasMap[reserva.dia_semana] : 1
      const hoje = new Date()
      const proximasSemanas = []

      for (let i = 0; i < 4; i++) {
        const data = addDays(startOfWeek(hoje, { locale: ptBR }), diaSemana + (i * 7))
        
        const [horaInicio, minutoInicio] = reserva.hora_inicio.split(":").map(Number)
        const [horaFim, minutoFim] = reserva.hora_fim.split(":").map(Number)
        
        const start = setMinutes(setHours(data, horaInicio), minutoInicio)
        const end = setMinutes(setHours(data, horaFim), minutoFim)

        proximasSemanas.push({
          id: `${reserva.id}-week-${i}`,
          title: `${reserva.disciplina || reserva.categoria} - ${reserva.professor}`,
          start,
          end,
          resource: reserva,
        })
      }
      
      return proximasSemanas
    } else {
      // Para eventos e temporárias, usar data específica
      const data = reserva.data_inicio ? new Date(reserva.data_inicio + "T00:00:00") : new Date()
      const [horaInicio, minutoInicio] = reserva.hora_inicio.split(":").map(Number)
      const [horaFim, minutoFim] = reserva.hora_fim.split(":").map(Number)
      
      const start = setMinutes(setHours(data, horaInicio), minutoInicio)
      const end = setMinutes(setHours(data, horaFim), minutoFim)

      return [{
        id: reserva.id.toString(),
        title: `${reserva.disciplina || reserva.categoria} - ${reserva.professor}`,
        start,
        end,
        resource: reserva,
      }]
    }
  })

  // Customizar cores dos eventos
  const eventStyleGetter = (event: any) => {
    const reserva = event.resource as Reserva
    
    let backgroundColor = "#3b82f6" // Azul padrão
    
    if (reserva.categoria === "aula") backgroundColor = "#3b82f6" // Azul
    else if (reserva.categoria === "reuniao") backgroundColor = "#8b5cf6" // Roxo
    else if (reserva.categoria === "evento") backgroundColor = "#10b981" // Verde
    else if (reserva.categoria === "manutencao") backgroundColor = "#f59e0b" // Laranja

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "0.875rem",
        fontWeight: "500",
      },
    }
  }

  const handleSelectEvent = (event: any) => {
    const reserva = event.resource as Reserva
    setSelectedReserva(reserva)
    setDialogOpen(true)
  }

  const messages = {
    today: "Hoje",
    previous: "Anterior",
    next: "Próximo",
    month: "Mês",
    week: "Semana",
    day: "Dia",
    agenda: "Agenda",
    date: "Data",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Nenhuma reserva neste período",
    showMore: (total: number) => `+ Ver mais (${total})`,
  }

  const diasLabels: Record<string, string> = {
    seg: "Segunda-feira",
    ter: "Terça-feira",
    qua: "Quarta-feira",
    qui: "Quinta-feira",
    sex: "Sexta-feira",
    sab: "Sábado",
  }

  return (
    <div className="space-y-4">
      {/* Calendário */}
      <Card className="p-6 bg-white">
        <div className="calendar-wrapper" style={{ height: "700px" }}>
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            messages={messages}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            views={["month", "week", "day", "agenda"]}
            min={new Date(2024, 0, 1, 7, 0, 0)} // 7h
            max={new Date(2024, 0, 1, 23, 0, 0)} // 23h
            culture="pt-BR"
            popup
            toolbar={true}
          />
        </div>
      </Card>

      {/* Legenda */}
      <Card className="p-4 bg-slate-50">
        <p className="text-sm font-semibold text-slate-900 mb-3">Legenda</p>
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

      {/* Dialog de Detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#132B1E]" />
              Detalhes da Reserva
            </DialogTitle>
            <DialogDescription>
              Informações completas da reserva
            </DialogDescription>
          </DialogHeader>

          {selectedReserva && (
            <div className="space-y-4 py-4">
              {/* Sala e Tipo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#132B1E] rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#B39C66]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedReserva.sala_nome}</h3>
                    <p className="text-sm text-slate-600">Prédio {selectedReserva.predio}</p>
                  </div>
                </div>
                <Badge className={
                  selectedReserva.tipo === "fixa" ? "bg-purple-500" :
                  selectedReserva.tipo === "evento" ? "bg-green-500" :
                  "bg-blue-500"
                }>
                  {selectedReserva.tipo === "fixa" ? "🔁 Fixa" :
                   selectedReserva.tipo === "evento" ? "🎯 Evento" :
                   "📅 Temporária"}
                </Badge>
              </div>

              {/* Professor */}
              <Card className="p-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Professor/Responsável</p>
                    <p className="font-semibold text-slate-900">{selectedReserva.professor}</p>
                  </div>
                </div>
              </Card>

              {/* Horário */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-700">Horário</p>
                    <p className="font-semibold text-blue-900">
                      {selectedReserva.hora_inicio} - {selectedReserva.hora_fim}
                    </p>
                    {selectedReserva.tipo === "fixa" && selectedReserva.dia_semana && (
                      <p className="text-xs text-blue-600 mt-1">
                        Todas as {diasLabels[selectedReserva.dia_semana]}s
                      </p>
                    )}
                    {selectedReserva.data_inicio && (
                      <p className="text-xs text-blue-600 mt-1">
                        📅 {new Date(selectedReserva.data_inicio).toLocaleDateString("pt-BR")}
                        {selectedReserva.data_fim && ` até ${new Date(selectedReserva.data_fim).toLocaleDateString("pt-BR")}`}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Informações Acadêmicas */}
              {(selectedReserva.disciplina || selectedReserva.curso || selectedReserva.turma) && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Informações Acadêmicas</p>
                  {selectedReserva.disciplina && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">Disciplina:</span>
                      <span className="font-medium text-slate-900">{selectedReserva.disciplina}</span>
                    </div>
                  )}
                  {selectedReserva.curso && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">Curso:</span>
                      <span className="font-medium text-slate-900">{selectedReserva.curso}</span>
                    </div>
                  )}
                  {selectedReserva.turma && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">Turma:</span>
                      <span className="font-medium text-slate-900">{selectedReserva.turma}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Categoria */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {selectedReserva.categoria}
                </Badge>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onReservaClick(selectedReserva)
                    setDialogOpen(false)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => {
                    if (confirm("Deseja cancelar esta reserva?")) {
                      // Implementar cancelamento
                      setDialogOpen(false)
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CSS Customizado para o Calendário */}
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }

        .rbc-header {
          padding: 12px 6px;
          font-weight: 600;
          color: #0f172a;
          background-color: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }

        .rbc-today {
          background-color: #fef3c7 !important;
        }

        .rbc-event {
          padding: 4px 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .rbc-event:hover {
          opacity: 1 !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }

        .rbc-event-label {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .rbc-event-content {
          font-size: 0.875rem;
        }

        .rbc-toolbar {
          padding: 16px;
          margin-bottom: 16px;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .rbc-toolbar button {
          color: #0f172a;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .rbc-toolbar button:hover {
          background-color: #132B1E;
          color: #B39C66;
          border-color: #132B1E;
        }

        .rbc-toolbar button.rbc-active {
          background-color: #132B1E;
          color: #B39C66;
          border-color: #132B1E;
        }

        .rbc-time-slot {
          min-height: 40px;
        }

        .rbc-timeslot-group {
          min-height: 80px;
          border-left: 1px solid #e2e8f0;
        }

        .rbc-time-header-content {
          border-left: 1px solid #e2e8f0;
        }

        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f1f5f9;
        }

        .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }

        .rbc-agenda-table {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .rbc-agenda-table tbody > tr > td {
          padding: 12px;
        }

        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell {
          font-weight: 600;
          color: #0f172a;
        }
      `}</style>
    </div>
  )
}
