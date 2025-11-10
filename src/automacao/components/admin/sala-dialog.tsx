"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Lightbulb, Projector, Wind, Wifi, Speaker, Thermometer, Edit, MonitorDot } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getRelayIdPorTipo } from "@/lib/relay-mapping"
import { useToast } from "@/hooks/use-toast"

type Equipamento = {
  id: number
  tipo: "luz" | "projetor" | "ar_condicionado" | "computador" | "audio" | "rede"
  nome: string
  status: "ativo" | "inativo" | "manutencao"
  identificador?: string
  relay_id?: number | null
}

export function SalaDialog({ sala, onSave }: { sala?: any; onSave: (data: any) => void }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nome: sala?.nome || "",
    tipo: sala?.tipo || "aula",
    predio: sala?.predio || "A",
    capacidade: sala?.capacidade || "",
    andar: sala?.andar || "",
    area_m2: sala?.area_m2 || "",
    patrocinada: sala?.patrocinada || false,
    empresa_patrocinadora: sala?.empresa_patrocinadora || "",
    observacoes: sala?.observacoes || "",
    ativo: sala?.ativo ?? true,
    equipamentos: sala?.equipamentos || [] as Equipamento[],
  })

  const [novoEquipamento, setNovoEquipamento] = useState({
    tipo: "luz" as const,
    nome: "",
  })

  const handleSubmit = async () => {
    try {
      const url = sala ? `/api/salas/${sala.id}` : "/api/salas"
      const method = sala ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave(formData)
        setOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar sala")
      }
    } catch (error) {
      console.error("Erro ao salvar sala:", error)
      alert("Erro ao salvar sala")
    }
  }

  const adicionarEquipamento = () => {
    if (!novoEquipamento.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do equipamento.",
      })
      return
    }
    
    // Verificar se já existe equipamento deste tipo
    const tipoJaExiste = formData.equipamentos.some(
      (eq: Equipamento) => eq.tipo === novoEquipamento.tipo
    )
    
    if (tipoJaExiste) {
      const tipoLabel = getTipoLabel(novoEquipamento.tipo)
      toast({
        variant: "destructive",
        title: "⚠️ Equipamento duplicado",
        description: `Já existe um equipamento do tipo "${tipoLabel}" nesta sala. Cada tipo de equipamento usa um relay específico e não pode ser duplicado.`,
      })
      return
    }
    
    // Relay ID é definido automaticamente baseado no tipo
    const relayId = getRelayIdPorTipo(novoEquipamento.tipo)
    
    const equipamento: Equipamento = {
      id: Date.now(),
      tipo: novoEquipamento.tipo,
      nome: novoEquipamento.nome,
      status: "ativo",
      identificador: `${novoEquipamento.tipo.toUpperCase()}-${Date.now()}`,
      relay_id: relayId,
    }
    
    setFormData({
      ...formData,
      equipamentos: [...formData.equipamentos, equipamento],
    })
    
    toast({
      title: "✅ Equipamento adicionado",
      description: `${equipamento.nome} (Relay ${relayId})`,
    })
    
    setNovoEquipamento({ tipo: "luz", nome: "" })
  }

  const removerEquipamento = (id: number) => {
    setFormData({
      ...formData,
      equipamentos: formData.equipamentos.filter((eq: Equipamento) => eq.id !== id),
    })
  }

  const getEquipamentoIcon = (tipo: string) => {
    const icons = {
      luz: Lightbulb,
      projetor: Projector,
      ar_condicionado: Wind,
      computador: MonitorDot,
      audio: Speaker,
      rede: Wifi,
    }
    return icons[tipo as keyof typeof icons] || Lightbulb
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      luz: "Iluminação",
      projetor: "Projetor",
      ar_condicionado: "Ar Condicionado",
      computador: "Computadores",
      audio: "Áudio",
      rede: "Rede",
    }
    return labels[tipo] || tipo
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {sala ? (
          <Button size="sm" variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        ) : (
          <Button className="bg-[#132B1E] hover:bg-[#132B1E]/90 text-[#B39C66] shadow-lg gap-2">
            <Plus className="w-5 h-5" />
            Nova Sala
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{sala ? "Editar Sala" : "Nova Sala"}</DialogTitle>
          <DialogDescription>
            {sala ? "Atualize as informações da sala e seus equipamentos" : "Cadastre uma nova sala no sistema"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Informações Básicas</h3>
          </div>
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Sala *</Label>
            <Input
              id="nome"
              placeholder="Ex: Lab. Informática 301"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          {/* Tipo e Prédio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aula">Sala de Aula</SelectItem>
                  <SelectItem value="lab_info">Lab. Informática</SelectItem>
                  <SelectItem value="lab_make">Lab. Maker</SelectItem>
                  <SelectItem value="meet">Sala de Reunião</SelectItem>
                  <SelectItem value="teatro">Auditório</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="predio">Prédio *</Label>
              <Select value={formData.predio} onValueChange={(v) => setFormData({ ...formData, predio: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Prédio A</SelectItem>
                  <SelectItem value="B">Prédio B</SelectItem>
                  <SelectItem value="C">Prédio C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Capacidade, Andar e Área */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade *</Label>
              <Input
                id="capacidade"
                type="number"
                min="1"
                max="500"
                placeholder="40"
                value={formData.capacidade}
                onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
              />
              <p className="text-xs text-slate-500">Pessoas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="andar">Andar</Label>
              <Input
                id="andar"
                type="number"
                min="1"
                max="30"
                placeholder="1"
                value={formData.andar}
                onChange={(e) => setFormData({ ...formData, andar: e.target.value })}
              />
              <p className="text-xs text-slate-500">Nº do andar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área (m²)</Label>
              <Input
                id="area"
                type="number"
                min="1"
                placeholder="50"
                value={formData.area_m2}
                onChange={(e) => setFormData({ ...formData, area_m2: e.target.value })}
              />
              <p className="text-xs text-slate-500">Metros²</p>
            </div>
          </div>

          {/* Patrocinada */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="patrocinada"
              checked={formData.patrocinada}
              onCheckedChange={(checked) => setFormData({ ...formData, patrocinada: checked as boolean })}
            />
            <Label htmlFor="patrocinada" className="font-normal cursor-pointer">
              Sala patrocinada/parceria
            </Label>
          </div>

          {/* Empresa Patrocinadora */}
          {formData.patrocinada && (
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa Patrocinadora</Label>
              <Input
                id="empresa"
                placeholder="Nome da empresa"
                value={formData.empresa_patrocinadora}
                onChange={(e) => setFormData({ ...formData, empresa_patrocinadora: e.target.value })}
              />
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre a sala..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Ativo */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked as boolean })}
            />
            <Label htmlFor="ativo" className="font-normal cursor-pointer">
              Sala ativa
            </Label>
          </div>

          {/* Equipamentos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Equipamentos</h3>
            
            {/* Adicionar Equipamento */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-1/3 space-y-2">
                  <Label htmlFor="tipoEquip">Tipo de Equipamento</Label>
                  <Select 
                    value={novoEquipamento.tipo} 
                    onValueChange={(v: any) => setNovoEquipamento({ ...novoEquipamento, tipo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        value="luz" 
                        disabled={formData.equipamentos.some((eq: Equipamento) => eq.tipo === "luz")}
                      >
                        💡 Iluminação (Relay 1) {formData.equipamentos.some((eq: Equipamento) => eq.tipo === "luz") && "✓"}
                      </SelectItem>
                      <SelectItem 
                        value="projetor"
                        disabled={formData.equipamentos.some((eq: Equipamento) => eq.tipo === "projetor")}
                      >
                        📽️ Projetor (Relay 2) {formData.equipamentos.some((eq: Equipamento) => eq.tipo === "projetor") && "✓"}
                      </SelectItem>
                      <SelectItem 
                        value="computador"
                        disabled={formData.equipamentos.some((eq: Equipamento) => eq.tipo === "computador")}
                      >
                        💻 Computadores (Relay 4) {formData.equipamentos.some((eq: Equipamento) => eq.tipo === "computador") && "✓"}
                      </SelectItem>
                      <SelectItem 
                        value="audio"
                        disabled={formData.equipamentos.some((eq: Equipamento) => eq.tipo === "audio")}
                      >
                        🔊 Áudio (Relay 6) {formData.equipamentos.some((eq: Equipamento) => eq.tipo === "audio") && "✓"}
                      </SelectItem>
                      <SelectItem 
                        value="rede"
                        disabled={formData.equipamentos.some((eq: Equipamento) => eq.tipo === "rede")}
                      >
                        📡 Rede (Relay 9) {formData.equipamentos.some((eq: Equipamento) => eq.tipo === "rede") && "✓"}
                      </SelectItem>
                      <SelectItem 
                        value="ar_condicionado"
                        disabled={formData.equipamentos.some((eq: Equipamento) => eq.tipo === "ar_condicionado")}
                      >
                        ❄️ Ar Condicionado (Relay 10) {formData.equipamentos.some((eq: Equipamento) => eq.tipo === "ar_condicionado") && "✓"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="nomeEquip">Nome do Equipamento</Label>
                  <div className="flex gap-2">
                    <Input
                      id="nomeEquip"
                      placeholder="Ex: Projetor Epson 2024"
                      value={novoEquipamento.nome}
                      onChange={(e) => setNovoEquipamento({ ...novoEquipamento, nome: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          adicionarEquipamento()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={adicionarEquipamento}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 mb-1">
                  ℹ️ <strong>Regras importantes:</strong>
                </p>
                <ul className="text-xs text-blue-700 ml-4 space-y-1 list-disc">
                  <li>O relay é definido automaticamente pelo tipo</li>
                  <li><strong>Apenas 1 equipamento por tipo</strong> é permitido</li>
                  <li>Cada tipo usa um relay específico (evita conflitos)</li>
                </ul>
              </div>
            </div>

            {/* Lista de Equipamentos */}
            {formData.equipamentos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  {formData.equipamentos.length} equipamento{formData.equipamentos.length > 1 ? "s" : ""} cadastrado{formData.equipamentos.length > 1 ? "s" : ""}
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {formData.equipamentos.map((eq: Equipamento) => {
                    const Icon = getEquipamentoIcon(eq.tipo)
                    return (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{eq.nome}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-slate-500">{getTipoLabel(eq.tipo)}</p>
                              {eq.relay_id && (
                                <Badge variant="outline" className="text-xs">
                                  ⚡ Relay {eq.relay_id}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removerEquipamento(eq.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {formData.equipamentos.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                Nenhum equipamento adicionado
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-[#132B1E] hover:bg-[#132B1E]/90 text-[#B39C66]">
            {sala ? "Salvar Alterações" : "Criar Sala"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

