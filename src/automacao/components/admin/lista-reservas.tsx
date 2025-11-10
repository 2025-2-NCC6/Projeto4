"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Building2, BookOpen, Calendar, Edit, X, List } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"

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
  status: string
  data_inicio?: string
  data_fim?: string
  observacao?: string
}

type ListaReservasProps = {
  reservas: Reserva[]
  onReservaDeleted?: () => void
}

export function ListaReservas({ reservas, onReservaDeleted }: ListaReservasProps) {
  const { toast } = useToast()
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    reserva: null as Reserva | null,
  })

  const diasLabels: Record<string, string> = {
    seg: "Seg",
    ter: "Ter",
    qua: "Qua",
    qui: "Qui",
    sex: "Sex",
    sab: "Sáb",
    dom: "Dom",
  }

  const categoriaLabels: Record<string, string> = {
    aula: "📚 Aula",
    reuniao: "👥 Reunião",
    evento: "🎯 Evento",
    manutencao: "🔧 Manutenção",
  }

  const handleCancelarClick = (reserva: Reserva) => {
    setConfirmDialog({
      open: true,
      reserva,
    })
  }

  const handleCancelarConfirm = async () => {
    if (!confirmDialog.reserva) return

    const reserva = confirmDialog.reserva

    try {
      const response = await fetch(`/api/reservas/${reserva.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Chamar callback para atualizar lista
        if (onReservaDeleted) {
          onReservaDeleted()
        }

        toast({
          title: "🗑️ Reserva cancelada",
          description: `Reserva de ${reserva.professor} em ${reserva.sala_nome} foi cancelada com sucesso.`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "❌ Erro ao cancelar",
          description: error.error || "Não foi possível cancelar a reserva",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "❌ Erro",
        description: "Erro ao cancelar reserva. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setConfirmDialog({ open: false, reserva: null })
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabela de Reservas */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sala</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Professor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Frequência</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Horário</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Disciplina</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Categoria</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reservas.map((reserva) => (
                <tr 
                  key={reserva.id} 
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* Tipo */}
                  <td className="px-6 py-4">
                    <Badge className={
                      reserva.tipo === "fixa" ? "bg-purple-500" :
                      reserva.tipo === "evento" ? "bg-green-500" :
                      "bg-blue-500"
                    }>
                      {reserva.tipo === "fixa" ? "🔁 Fixa" :
                       reserva.tipo === "evento" ? "🎯 Evento" :
                       "📅 Temp."}
                    </Badge>
                  </td>

                  {/* Sala */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="font-semibold text-slate-900">{reserva.sala_nome}</p>
                        <p className="text-xs text-slate-500">Prédio {reserva.predio}</p>
                      </div>
                    </div>
                  </td>

                  {/* Professor */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-900">{reserva.professor}</span>
                    </div>
                  </td>

                  {/* Frequência */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      {reserva.tipo === "fixa" && reserva.dia_semana && (
                        <Badge variant="outline" className="text-xs">
                          {diasLabels[reserva.dia_semana]}
                        </Badge>
                      )}
                      {(reserva.tipo === "temporaria" || reserva.tipo === "evento") && reserva.data_inicio && (
                        <span className="text-xs text-slate-700">
                          {new Date(reserva.data_inicio).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                          {reserva.data_fim && ` - ${new Date(reserva.data_fim).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}`}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Horário */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {reserva.hora_inicio} - {reserva.hora_fim}
                      </span>
                    </div>
                  </td>

                  {/* Disciplina */}
                  <td className="px-6 py-4">
                    {reserva.disciplina ? (
                      <div>
                        <p className="text-sm font-medium text-slate-900">{reserva.disciplina}</p>
                        {reserva.curso && (
                          <p className="text-xs text-slate-500">{reserva.curso}</p>
                        )}
                        {reserva.turma && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {reserva.turma}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>

                  {/* Categoria */}
                  <td className="px-6 py-4">
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        reserva.categoria === "aula" ? "border-blue-500 text-blue-700 bg-blue-50" :
                        reserva.categoria === "reuniao" ? "border-purple-500 text-purple-700 bg-purple-50" :
                        reserva.categoria === "evento" ? "border-green-500 text-green-700 bg-green-50" :
                        "border-orange-500 text-orange-700 bg-orange-50"
                      }`}
                    >
                      {categoriaLabels[reserva.categoria]}
                    </Badge>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log("Editar reserva:", reserva.id)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => handleCancelarClick(reserva)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {reservas.length > 20 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Mostrando {reservas.length} reserva(s)
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Anterior</Button>
              <Button size="sm" variant="outline">Próxima</Button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {reservas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <List className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-slate-600">Ajuste os filtros ou crie uma nova reserva</p>
        </div>
      )}

      {/* Legenda */}
      <Card className="p-4 bg-slate-50">
        <p className="text-sm font-semibold text-slate-900 mb-3">Legenda de Categorias</p>
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

      {/* Dialog de Confirmação */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, reserva: null })}
        title="Cancelar reserva?"
        description={
          confirmDialog.reserva
            ? `Tem certeza que deseja cancelar a reserva de ${confirmDialog.reserva.professor} para ${confirmDialog.reserva.sala_nome}${confirmDialog.reserva.disciplina ? ` (${confirmDialog.reserva.disciplina})` : ""}? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmText="Sim, cancelar"
        cancelText="Não, manter"
        onConfirm={handleCancelarConfirm}
        variant="destructive"
      />
    </div>
  )
}
