"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Sala {
  id: number
  nome: string
  predio: string
  capacidade: number
  tipo_sala: string
  equipamentos: { tipo: string }[]
}

export default function SolicitarReservaPage() {
  const { usuario } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSalas, setLoadingSalas] = useState(true)
  
  const [formData, setFormData] = useState({
    sala_id: "",
    tipo_reserva: "temporaria",
    data: "",
    horario_inicio: "",
    horario_fim: "",
    finalidade: "",
    observacoes: "",
    // Campos específicos para aulas (se professor)
    disciplina: "",
    turma: "",
    periodo_academico: "",
  })

  useEffect(() => {
    fetchSalas()
  }, [])

  const fetchSalas = async () => {
    try {
      const response = await fetch("/api/salas?disponiveis=true")
      const data = await response.json()
      
      if (data.success) {
        setSalas(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar salas:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as salas disponíveis.",
      })
    } finally {
      setLoadingSalas(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.sala_id || !formData.data || !formData.horario_inicio || !formData.horario_fim) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
      })
      return
    }

    // Validar horários
    if (formData.horario_inicio >= formData.horario_fim) {
      toast({
        variant: "destructive",
        title: "Horário inválido",
        description: "O horário de término deve ser posterior ao horário de início.",
      })
      return
    }

    setLoading(true)

    try {
      // Verificar conflitos
      const conflitosResponse = await fetch("/api/reservas/check-conflitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sala_id: parseInt(formData.sala_id),
          data: formData.data,
          horario_inicio: formData.horario_inicio,
          horario_fim: formData.horario_fim,
          tipo_reserva: formData.tipo_reserva,
        }),
      })

      const conflitosData = await conflitosResponse.json()

      if (!conflitosData.disponivel) {
        toast({
          variant: "destructive",
          title: "Conflito de Horário",
          description: `A sala já está reservada neste horário. ${conflitosData.conflitos?.length || 0} conflito(s) encontrado(s).`,
        })
        setLoading(false)
        return
      }

      // Criar solicitação de reserva
      const response = await fetch("/api/usuarios/solicitar-reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario?.id,
          sala_id: parseInt(formData.sala_id),
          tipo_reserva: formData.tipo_reserva,
          data: formData.data,
          horario_inicio: formData.horario_inicio,
          horario_fim: formData.horario_fim,
          finalidade: formData.finalidade,
          observacoes: formData.observacoes,
          disciplina: formData.disciplina || undefined,
          turma: formData.turma || undefined,
          periodo_academico: formData.periodo_academico || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Solicitação Enviada!",
          description: "Sua solicitação de reserva foi enviada para aprovação.",
        })
        
        // Redirecionar para minhas reservas após 2 segundos
        setTimeout(() => {
          router.push("/usuario/minhas-reservas")
        }, 2000)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao solicitar reserva",
        description: error.message || "Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSalaInfo = (salaId: string) => {
    return salas.find(s => s.id === parseInt(salaId))
  }

  const salaSelecionada = formData.sala_id ? getSalaInfo(formData.sala_id) : null

  // Aguardar carregamento do usuário
  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#132B1E]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Solicitar Reserva</h1>
        <p className="text-slate-600 mt-2">
          Preencha os dados abaixo para solicitar uma reserva de sala
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações da Reserva */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Informações da Reserva
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Reserva */}
            <div>
              <Label htmlFor="tipo_reserva">Tipo de Reserva *</Label>
              <Select
                value={formData.tipo_reserva}
                onValueChange={(value) => setFormData({ ...formData, tipo_reserva: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporaria">Reserva Única</SelectItem>
                  {usuario?.tipo_usuario === "professor" && (
                    <SelectItem value="fixa">Reserva Fixa (Semestre)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Sala */}
            <div>
              <Label htmlFor="sala_id">Sala *</Label>
              <Select
                value={formData.sala_id}
                onValueChange={(value) => setFormData({ ...formData, sala_id: value })}
                disabled={loadingSalas}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingSalas ? "Carregando..." : "Selecione uma sala"} />
                </SelectTrigger>
                <SelectContent>
                  {salas.map((sala) => (
                    <SelectItem key={sala.id} value={sala.id.toString()}>
                      {sala.nome} - {sala.predio} ({sala.capacidade} lugares)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Horário Início */}
            <div>
              <Label htmlFor="horario_inicio">Horário de Início *</Label>
              <Input
                id="horario_inicio"
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                required
              />
            </div>

            {/* Horário Fim */}
            <div>
              <Label htmlFor="horario_fim">Horário de Término *</Label>
              <Input
                id="horario_fim"
                type="time"
                value={formData.horario_fim}
                onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                required
              />
            </div>

            {/* Finalidade */}
            <div>
              <Label htmlFor="finalidade">Finalidade</Label>
              <Input
                id="finalidade"
                placeholder="Ex: Reunião, Apresentação, Estudo..."
                value={formData.finalidade}
                onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="mt-6">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre a reserva..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={4}
            />
          </div>
        </Card>

        {/* Campos específicos para professores */}
        {usuario?.tipo_usuario === "professor" && formData.tipo_reserva === "fixa" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Informações Acadêmicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="disciplina">Disciplina</Label>
                <Input
                  id="disciplina"
                  placeholder="Ex: Banco de Dados"
                  value={formData.disciplina}
                  onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="turma">Turma</Label>
                <Input
                  id="turma"
                  placeholder="Ex: ADS 5A"
                  value={formData.turma}
                  onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="periodo_academico">Período Acadêmico</Label>
                <Input
                  id="periodo_academico"
                  placeholder="Ex: 2024.1"
                  value={formData.periodo_academico}
                  onChange={(e) => setFormData({ ...formData, periodo_academico: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Informações da Sala Selecionada */}
        {salaSelecionada && (
          <Card className="p-6 bg-gradient-to-br from-[#132B1E]/5 to-[#B39C66]/5 border-2 border-[#B39C66]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              📍 Sala Selecionada
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Nome</p>
                <p className="font-semibold text-slate-900">{salaSelecionada.nome}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Prédio</p>
                <p className="font-semibold text-slate-900">{salaSelecionada.predio}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Capacidade</p>
                <p className="font-semibold text-slate-900">{salaSelecionada.capacidade} pessoas</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Equipamentos</p>
                <p className="font-semibold text-slate-900">{salaSelecionada.equipamentos.length} itens</p>
              </div>
            </div>
          </Card>
        )}

        {/* Ações */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#132B1E] hover:bg-[#132B1E]/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Solicitar Reserva
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

