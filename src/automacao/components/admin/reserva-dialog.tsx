"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type ReservaDialogProps = {
  reserva?: any
  onSave: () => void
}

export function ReservaDialog({ reserva, onSave }: ReservaDialogProps) {
  const [open, setOpen] = useState(false)
  const [salas, setSalas] = useState<any[]>([])
  const [professores, setProfessores] = useState<any[]>([])
  const [conflitos, setConflitos] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const [formData, setFormData] = useState({
    sala_id: reserva?.sala_id || "",
    usuario_id: reserva?.usuario_id || "",
    tipo: reserva?.tipo || "fixa",
    dia_semana: reserva?.dia_semana || "seg",
    hora_inicio: reserva?.hora_inicio || "07:00",
    hora_fim: reserva?.hora_fim || "09:00",
    data_inicio: reserva?.data_inicio || "",
    data_fim: reserva?.data_fim || "",
    curso: reserva?.curso || "",
    disciplina: reserva?.disciplina || "",
    turma: reserva?.turma || "",
    categoria: reserva?.categoria || "aula",
    observacao: reserva?.observacao || "",
  })

  useEffect(() => {
    if (open) {
      fetchSalas()
      fetchProfessores()
    }
  }, [open])

  useEffect(() => {
    if (formData.sala_id && formData.hora_inicio && formData.hora_fim) {
      checkConflitos()
    }
  }, [formData.sala_id, formData.dia_semana, formData.hora_inicio, formData.hora_fim, formData.data_inicio])

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

  const fetchProfessores = async () => {
    try {
      const response = await fetch("/api/usuarios?tipo=professor")
      const result = await response.json()
      if (result.success) {
        setProfessores(result.data)
      }
    } catch (error) {
      console.error("Erro ao carregar professores:", error)
    }
  }

  const checkConflitos = async () => {
    setIsChecking(true)
    setConflitos([])

    try {
      const params = new URLSearchParams({
        sala_id: formData.sala_id,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
        ...(formData.tipo === "fixa" && { dia_semana: formData.dia_semana }),
        ...(formData.data_inicio && { data_inicio: formData.data_inicio }),
      })

      const response = await fetch(`/api/reservas/check-conflitos?${params}`)
      const result = await response.json()

      if (result.conflitos && result.conflitos.length > 0) {
        setConflitos(result.conflitos)
      }
    } catch (error) {
      console.error("Erro ao verificar conflitos:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const url = reserva ? `/api/reservas/${reserva.id}` : "/api/reservas"
      const method = reserva ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
        setOpen(false)
        setFormData({
          sala_id: "",
          usuario_id: "",
          tipo: "fixa",
          dia_semana: "seg",
          hora_inicio: "07:00",
          hora_fim: "09:00",
          data_inicio: "",
          data_fim: "",
          curso: "",
          disciplina: "",
          turma: "",
          categoria: "aula",
          observacao: "",
        })
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar reserva")
      }
    } catch (error) {
      console.error("Erro ao salvar reserva:", error)
      alert("Erro ao salvar reserva")
    }
  }

  const diasSemana = [
    { value: "seg", label: "Segunda-feira" },
    { value: "ter", label: "Terça-feira" },
    { value: "qua", label: "Quarta-feira" },
    { value: "qui", label: "Quinta-feira" },
    { value: "sex", label: "Sexta-feira" },
    { value: "sab", label: "Sábado" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {reserva ? (
          <Button size="sm" variant="outline">
            Editar
          </Button>
        ) : (
          <Button className="bg-[#132B1E] hover:bg-[#132B1E]/90 text-[#B39C66] shadow-lg gap-2">
            <Plus className="w-5 h-5" />
            Nova Reserva
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{reserva ? "Editar Reserva" : "Nova Reserva"}</DialogTitle>
          <DialogDescription>
            {reserva ? "Atualize as informações da reserva" : "Crie uma reserva fixa, temporária ou evento pontual"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Tipo de Reserva */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Reserva *</Label>
            <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixa">🔁 Fixa (Recorrente - Semanal)</SelectItem>
                <SelectItem value="temporaria">📅 Temporária (Período Específico)</SelectItem>
                <SelectItem value="evento">🎯 Evento (Pontual)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {formData.tipo === "fixa" && "Repetida toda semana no mesmo dia e horário"}
              {formData.tipo === "temporaria" && "Válida apenas em um período específico"}
              {formData.tipo === "evento" && "Reserva pontual para evento único"}
            </p>
          </div>

          {/* Sala e Professor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sala">Sala *</Label>
              <Select value={formData.sala_id} onValueChange={(v) => setFormData({ ...formData, sala_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma sala" />
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

            <div className="space-y-2">
              <Label htmlFor="professor">Professor/Responsável *</Label>
              <Select value={formData.usuario_id} onValueChange={(v) => setFormData({ ...formData, usuario_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id.toString()}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dia da Semana (para fixas) ou Datas (para temporárias/eventos) */}
          {formData.tipo === "fixa" && (
            <div className="space-y-2">
              <Label htmlFor="dia_semana">Dia da Semana *</Label>
              <Select value={formData.dia_semana} onValueChange={(v) => setFormData({ ...formData, dia_semana: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {diasSemana.map((dia) => (
                    <SelectItem key={dia.value} value={dia.value}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(formData.tipo === "temporaria" || formData.tipo === "evento") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim {formData.tipo === "evento" && "(Opcional)"}</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora Início *</Label>
              <Input
                id="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_fim">Hora Fim *</Label>
              <Input
                id="hora_fim"
                type="time"
                value={formData.hora_fim}
                onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
              />
            </div>
          </div>

          {/* Conflitos */}
          {conflitos.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Conflitos Detectados</p>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {conflitos.map((conflito, idx) => (
                      <li key={idx}>• {conflito}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Informações Acadêmicas */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-slate-900">Informações Acadêmicas</h3>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aula">📚 Aula</SelectItem>
                  <SelectItem value="reuniao">👥 Reunião</SelectItem>
                  <SelectItem value="evento">🎯 Evento</SelectItem>
                  <SelectItem value="manutencao">🔧 Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="curso">Curso</Label>
                <Input
                  id="curso"
                  placeholder="Ex: Ciências da Computação"
                  value={formData.curso}
                  onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Input
                  id="turma"
                  placeholder="Ex: 3º Semestre A"
                  value={formData.turma}
                  onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disciplina">Disciplina</Label>
              <Input
                id="disciplina"
                placeholder="Ex: Programação Web"
                value={formData.disciplina}
                onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacao">Observações</Label>
              <Textarea
                id="observacao"
                placeholder="Informações adicionais..."
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-[#132B1E] hover:bg-[#132B1E]/90 text-[#B39C66]"
            disabled={conflitos.length > 0 || !formData.sala_id || !formData.usuario_id}
          >
            {reserva ? "Salvar Alterações" : "Criar Reserva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

