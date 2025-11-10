"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UserPlus, Calendar } from "lucide-react"

export function AtribuirUsuarioDialog({ 
  salaId, 
  salaNome, 
  hasReservas = false 
}: { 
  salaId: number
  salaNome: string
  hasReservas?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [tipoReserva, setTipoReserva] = useState<"fixa" | "evento">("fixa")
  const [formData, setFormData] = useState({
    usuarioId: "",
    turno: "manha", // manhã, tarde, noite
    categoria: "graduacao", // colegio, graduacao, evento
    curso: "",
    turma: "",
    disciplina: "",
    codigoDisciplina: "",
    numeroAlunos: "",
    diaSemana: "seg",
    horaInicio: "08:00",
    horaFim: "10:00",
    dataEvento: "",
    descricao: "",
    observacoes: "",
  })

  const handleSubmit = async () => {
    console.log("Atribuir usuário:", { salaId, tipoReserva, ...formData })
    // TODO: Implementar chamada API
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2 hover:bg-[#132B1E] hover:text-[#B39C66] hover:border-[#132B1E]"
        >
          <UserPlus className="w-4 h-4" />
          {hasReservas ? "Nova Reserva" : "Atribuir"}
        </Button>
      </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Atribuir Usuário</DialogTitle>
            <DialogDescription>
              Vincule um professor ou funcionário à sala <strong>{salaNome}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
          {/* Tipo de Reserva */}
          <div className="space-y-3">
            <Label>Tipo de Reserva</Label>
            <RadioGroup value={tipoReserva} onValueChange={(v) => setTipoReserva(v as any)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="fixa" id="fixa" />
                <Label htmlFor="fixa" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Horário Fixo</div>
                  <div className="text-xs text-slate-600">Aula semanal recorrente</div>
                </Label>
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="evento" id="evento" />
                <Label htmlFor="evento" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Evento/Parceria</div>
                  <div className="text-xs text-slate-600">Reserva pontual ou evento especial</div>
                </Label>
                <UserPlus className="w-5 h-5 text-slate-400" />
              </div>
            </RadioGroup>
          </div>

          {/* Seleção de Usuário */}
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuário *</Label>
            <Select value={formData.usuarioId} onValueChange={(v) => setFormData({ ...formData, usuarioId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um professor ou funcionário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Prof. João Silva</SelectItem>
                <SelectItem value="2">Prof. Maria Santos</SelectItem>
                <SelectItem value="3">Téc. Carlos Souza</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Horário Fixo */}
          {tipoReserva === "fixa" && (
            <>
              {/* Categoria e Turno */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colegio">🎒 Colégio</SelectItem>
                      <SelectItem value="graduacao">🎓 Graduação</SelectItem>
                      <SelectItem value="pos-graduacao">📚 Pós-Graduação</SelectItem>
                      <SelectItem value="extensao">📖 Extensão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turno">Turno *</Label>
                  <Select value={formData.turno} onValueChange={(v) => setFormData({ ...formData, turno: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manha">🌅 Manhã (07h-12h)</SelectItem>
                      <SelectItem value="tarde">☀️ Tarde (13h-18h)</SelectItem>
                      <SelectItem value="noite">🌙 Noite (19h-23h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               {/* Curso e Turma */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="curso">Curso *</Label>
                   <Select value={formData.curso} onValueChange={(v) => setFormData({ ...formData, curso: v })}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione o curso" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="administracao">Administração</SelectItem>
                       <SelectItem value="ciencias_computacao">Ciências da Computação</SelectItem>
                       <SelectItem value="engenharia">Engenharia</SelectItem>
                       <SelectItem value="direito">Direito</SelectItem>
                       <SelectItem value="economia">Economia</SelectItem>
                       <SelectItem value="contabeis">Ciências Contábeis</SelectItem>
                       <SelectItem value="marketing">Marketing</SelectItem>
                       <SelectItem value="relacoes_internacionais">Relações Internacionais</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="turma">Turma *</Label>
                   <Input
                     id="turma"
                     placeholder="Ex: 3º Semestre A"
                     value={formData.turma}
                     onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                   />
                   <p className="text-xs text-slate-500">Ex: 1º Ano B, 5º Semestre C</p>
                 </div>
               </div>

               {/* Disciplina */}
               <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2 col-span-2">
                   <Label htmlFor="disciplina">Disciplina *</Label>
                   <Input
                     id="disciplina"
                     placeholder="Ex: Cálculo I, Programação Web"
                     value={formData.disciplina}
                     onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                   />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="codigoDisciplina">Código</Label>
                   <Input
                     id="codigoDisciplina"
                     placeholder="MAT101"
                     value={formData.codigoDisciplina}
                     onChange={(e) => setFormData({ ...formData, codigoDisciplina: e.target.value })}
                   />
                 </div>
               </div>

               {/* Número de Alunos e Dia da Semana */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="numeroAlunos">Nº de Alunos</Label>
                   <Input
                     id="numeroAlunos"
                     type="number"
                     min="1"
                     placeholder="Ex: 35"
                     value={formData.numeroAlunos}
                     onChange={(e) => setFormData({ ...formData, numeroAlunos: e.target.value })}
                   />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="dia">Dia da Semana *</Label>
                   <Select value={formData.diaSemana} onValueChange={(v) => setFormData({ ...formData, diaSemana: v })}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="seg">Segunda-feira</SelectItem>
                       <SelectItem value="ter">Terça-feira</SelectItem>
                       <SelectItem value="qua">Quarta-feira</SelectItem>
                       <SelectItem value="qui">Quinta-feira</SelectItem>
                       <SelectItem value="sex">Sexta-feira</SelectItem>
                       <SelectItem value="sab">Sábado</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>

               {/* Horário */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="inicio">Hora Início *</Label>
                   <Input
                     id="inicio"
                     type="time"
                     value={formData.horaInicio}
                     onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="fim">Hora Fim *</Label>
                   <Input
                     id="fim"
                     type="time"
                     value={formData.horaFim}
                     onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                   />
                 </div>
               </div>

               {/* Observações */}
               <div className="space-y-2">
                 <Label htmlFor="observacoes">Observações</Label>
                 <Input
                   id="observacoes"
                   placeholder="Ex: Necessita projetor, Aula prática"
                   value={formData.observacoes}
                   onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                 />
               </div>
             </>
           )}

          {/* Evento/Parceria */}
          {tipoReserva === "evento" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dataEvento">Data do Evento</Label>
                <Input
                  id="dataEvento"
                  type="date"
                  value={formData.dataEvento}
                  onChange={(e) => setFormData({ ...formData, dataEvento: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inicioEvento">Hora Início</Label>
                  <Input
                    id="inicioEvento"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fimEvento">Hora Fim</Label>
                  <Input
                    id="fimEvento"
                    type="time"
                    value={formData.horaFim}
                    onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição do Evento</Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Workshop de IoT - Empresa XYZ"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-[#132B1E] hover:bg-[#132B1E]/90 text-[#B39C66]">
            {tipoReserva === "fixa" ? "Criar Horário Fixo" : "Reservar para Evento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

