"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Send,
  Lightbulb,
  Wind,
  Projector,
  Wifi,
  Monitor,
  Plug
} from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/hooks/use-toast"

interface Sala {
  id: number
  nome: string
  predio: string
}

interface ProblemaReportado {
  id: number
  sala_nome: string
  predio: string
  tipo_problema: string
  descricao: string
  status: string
  data_registro: string
  data_resolucao?: string
}

export default function ProblemasPage() {
  const { usuario } = useUser()
  const { toast } = useToast()
  const [salas, setSalas] = useState<Sala[]>([])
  const [problemas, setProblemas] = useState<ProblemaReportado[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSalas, setLoadingSalas] = useState(true)
  const [loadingProblemas, setLoadingProblemas] = useState(true)
  const [activeTab, setActiveTab] = useState<"reportar" | "historico">("reportar")
  
  const [formData, setFormData] = useState({
    sala_id: "",
    tipo_problema: "",
    descricao: "",
  })

  useEffect(() => {
    fetchSalas()
    if (usuario?.id) {
      fetchProblemas()
    }
  }, [usuario])

  const fetchSalas = async () => {
    try {
      const response = await fetch("/api/salas")
      const data = await response.json()
      
      if (data.success) {
        setSalas(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar salas:", error)
    } finally {
      setLoadingSalas(false)
    }
  }

  const fetchProblemas = async () => {
    try {
      const response = await fetch(`/api/usuarios/${usuario?.id}/problemas`)
      const data = await response.json()
      
      if (data.success) {
        setProblemas(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar problemas:", error)
    } finally {
      setLoadingProblemas(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sala_id || !formData.tipo_problema || !formData.descricao) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para reportar o problema.",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/problemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario?.id,
          sala_id: parseInt(formData.sala_id),
          tipo_problema: formData.tipo_problema,
          descricao: formData.descricao,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Problema Reportado!",
          description: "Seu relato foi registrado e será analisado pela equipe de manutenção.",
        })
        
        // Limpar formulário
        setFormData({
          sala_id: "",
          tipo_problema: "",
          descricao: "",
        })

        // Atualizar lista de problemas
        fetchProblemas()

        // Mudar para aba de histórico
        setTimeout(() => setActiveTab("historico"), 1000)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao reportar problema",
        description: error.message || "Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolvido":
        return "bg-green-100 text-green-700 border-green-300"
      case "em_analise":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "pendente":
        return "bg-orange-100 text-orange-700 border-orange-300"
      case "rejeitado":
        return "bg-red-100 text-red-700 border-red-300"
      default:
        return "bg-slate-100 text-slate-700 border-slate-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolvido":
        return <CheckCircle2 className="w-4 h-4" />
      case "em_analise":
        return <Clock className="w-4 h-4" />
      case "pendente":
        return <AlertTriangle className="w-4 h-4" />
      case "rejeitado":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "iluminacao":
        return <Lightbulb className="w-5 h-5 text-yellow-600" />
      case "ar_condicionado":
        return <Wind className="w-5 h-5 text-blue-600" />
      case "projetor":
        return <Projector className="w-5 h-5 text-purple-600" />
      case "rede":
        return <Wifi className="w-5 h-5 text-green-600" />
      case "computador":
        return <Monitor className="w-5 h-5 text-slate-600" />
      case "tomada":
        return <Plug className="w-5 h-5 text-orange-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Aguardar carregamento do usuário
  if (!usuario) {
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
        <h1 className="text-3xl font-bold text-slate-900">Reportar Problemas</h1>
        <p className="text-slate-600 mt-2">
          Encontrou algum problema em uma sala? Reporte aqui para nossa equipe.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("reportar")}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === "reportar"
              ? "border-[#132B1E] text-[#132B1E]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Reportar Problema
        </button>
        <button
          onClick={() => setActiveTab("historico")}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === "historico"
              ? "border-[#132B1E] text-[#132B1E]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Meus Relatos ({problemas.length})
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "reportar" ? (
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Informações do Problema
            </h2>

            <div className="space-y-6">
              {/* Sala */}
              <div>
                <Label htmlFor="sala_id">Sala *</Label>
                <Select
                  value={formData.sala_id}
                  onValueChange={(value) => setFormData({ ...formData, sala_id: value })}
                  disabled={loadingSalas}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSalas ? "Carregando..." : "Selecione a sala"} />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((sala) => (
                      <SelectItem key={sala.id} value={sala.id.toString()}>
                        {sala.nome} - {sala.predio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Problema */}
              <div>
                <Label htmlFor="tipo_problema">Tipo de Problema *</Label>
                <Select
                  value={formData.tipo_problema}
                  onValueChange={(value) => setFormData({ ...formData, tipo_problema: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iluminacao">💡 Iluminação</SelectItem>
                    <SelectItem value="ar_condicionado">❄️ Ar-Condicionado</SelectItem>
                    <SelectItem value="projetor">📽️ Projetor</SelectItem>
                    <SelectItem value="rede">📡 Rede/Internet</SelectItem>
                    <SelectItem value="computador">💻 Computador</SelectItem>
                    <SelectItem value="tomada">🔌 Tomadas</SelectItem>
                    <SelectItem value="mobiliario">🪑 Mobiliário</SelectItem>
                    <SelectItem value="limpeza">🧹 Limpeza</SelectItem>
                    <SelectItem value="outro">🔧 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="descricao">Descrição do Problema *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva detalhadamente o problema encontrado..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={6}
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Seja o mais específico possível para ajudar na resolução.
                </p>
              </div>
            </div>
          </Card>

          {/* Botão de Enviar */}
          <Button
            type="submit"
            className="w-full bg-[#132B1E] hover:bg-[#132B1E]/90"
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar Relato
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Filtros de Status */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
              Todos ({problemas.length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
              Pendentes ({problemas.filter(p => p.status === "pendente").length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
              Em Análise ({problemas.filter(p => p.status === "em_analise").length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
              Resolvidos ({problemas.filter(p => p.status === "resolvido").length})
            </Badge>
          </div>

          {/* Lista de Problemas */}
          {loadingProblemas ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#132B1E]"></div>
            </div>
          ) : problemas.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhum problema reportado
              </h3>
              <p className="text-slate-600">
                Você ainda não reportou nenhum problema. Use a aba "Reportar Problema" para criar um relato.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {problemas.map((problema) => (
                <Card key={problema.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      {getTipoIcon(problema.tipo_problema)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {problema.sala_nome} - {problema.predio}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Tipo: {problema.tipo_problema.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                        <Badge className={getStatusColor(problema.status)}>
                          {getStatusIcon(problema.status)}
                          <span className="ml-1 capitalize">
                            {problema.status.replace(/_/g, ' ')}
                          </span>
                        </Badge>
                      </div>

                      <p className="text-slate-700 text-sm mb-3">
                        {problema.descricao}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📅 Reportado em {formatarData(problema.data_registro)}</span>
                        {problema.data_resolucao && (
                          <span>✅ Resolvido em {formatarData(problema.data_resolucao)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

