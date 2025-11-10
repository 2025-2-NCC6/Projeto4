"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useRFIDStream } from "@/hooks/use-rfid-stream"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: number
  nome: string
  tipo: string
  email: string | null
  tag_uid: string | null
  ativo: boolean | null
  ultimo_acesso: Date | null
}

export default function UsuariosPage() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  
  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  })
  
  // Form data
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    tipo: "professor",
    tag_uid: "",
  })
  
  // RFID reading
  const [rfidSessionId, setRfidSessionId] = useState<string | null>(null)
  const [isReadingRFID, setIsReadingRFID] = useState(false)
  const [rfidMessage, setRfidMessage] = useState("")
  
  // Hook para SSE do RFID
  const { cardId, isConnected, error: rfidError } = useRFIDStream(rfidSessionId, isReadingRFID)

  // Quando um cartão for lido, atualizar o form
  useEffect(() => {
    if (cardId) {
      setFormData({ ...formData, tag_uid: cardId })
      setRfidMessage("✅ Cartão lido com sucesso!")
      setIsReadingRFID(false)
      setRfidSessionId(null)
      
      setTimeout(() => setRfidMessage(""), 3000)
    }
  }, [cardId])

  // Tratar erros de RFID
  useEffect(() => {
    if (rfidError) {
      setRfidMessage(`❌ ${rfidError}`)
      setIsReadingRFID(false)
      setRfidSessionId(null)
      
      setTimeout(() => setRfidMessage(""), 3000)
    }
  }, [rfidError])

  useEffect(() => {
    fetchUsuarios()
  }, [])

  useEffect(() => {
    filterUsuarios()
  }, [searchTerm, filterTipo, usuarios])

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios")
      const result = await response.json()
      
      if (result.success) {
        setUsuarios(result.data)
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsuarios = () => {
    let filtered = usuarios

    if (filterTipo !== "all") {
      filtered = filtered.filter(u => u.tipo === filterTipo)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(u =>
        u.nome.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.tag_uid?.toLowerCase().includes(term)
      )
    }

    setFilteredUsuarios(filtered)
  }

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUser(usuario)
      setFormData({
        nome: usuario.nome,
        email: usuario.email || "",
        tipo: usuario.tipo || "professor",
        tag_uid: usuario.tag_uid || "",
      })
    } else {
      setEditingUser(null)
      setFormData({
        nome: "",
        email: "",
        tipo: "professor",
        tag_uid: "",
      })
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : "/api/usuarios"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // Atualizar lista sem reload
        if (editingUser) {
          // Atualizar usuário existente
          setUsuarios(prevUsuarios =>
            prevUsuarios.map(u =>
              u.id === editingUser.id
                ? { ...u, ...formData, ativo: u.ativo }
                : u
            )
          )
        } else {
          // Adicionar novo usuário
          setUsuarios(prevUsuarios => [
            ...prevUsuarios,
            {
              id: result.data.id,
              ...formData,
              ativo: true,
              ultimo_acesso: null,
            },
          ])
        }

        setOpenDialog(false)
        setEditingUser(null)
        setFormData({
          nome: "",
          email: "",
          tipo: "professor",
          tag_uid: "",
        })
        
        toast({
          title: editingUser ? "✅ Usuário atualizado!" : "✅ Usuário cadastrado!",
          description: `${formData.nome} foi ${editingUser ? "atualizado" : "cadastrado"} com sucesso.`,
          variant: "default",
        })
        
        console.log("Toast disparado:", {
          title: editingUser ? "✅ Usuário atualizado!" : "✅ Usuário cadastrado!",
          description: `${formData.nome} foi ${editingUser ? "atualizado" : "cadastrado"} com sucesso.`,
        })
      } else {
        toast({
          title: "❌ Erro ao salvar",
          description: result.error || "Erro ao salvar usuário",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar usuário. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = (id: number, ativo: boolean) => {
    const usuario = usuarios.find(u => u.id === id)
    if (!usuario) return

    setConfirmDialog({
      open: true,
      title: ativo ? "Desativar usuário?" : "Ativar usuário?",
      description: ativo 
        ? `O usuário ${usuario.nome} será desativado e não poderá mais acessar o sistema.`
        : `O usuário ${usuario.nome} será reativado e poderá acessar o sistema normalmente.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/usuarios/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ativo: !ativo }),
          })

          if (response.ok) {
            // Atualizar estado localmente sem reload
            setUsuarios(prevUsuarios =>
              prevUsuarios.map(u =>
                u.id === id ? { ...u, ativo: !ativo } : u
              )
            )
            
            toast({
              title: ativo ? "🔒 Usuário desativado" : "✅ Usuário ativado",
              description: `${usuario.nome} foi ${ativo ? "desativado" : "ativado"} com sucesso.`,
            })
          } else {
            toast({
              title: "❌ Erro",
              description: "Erro ao alterar status do usuário",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Erro:", error)
          toast({
            title: "❌ Erro",
            description: "Erro ao alterar status do usuário",
            variant: "destructive",
          })
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }))
        }
      },
    })
  }

  const handleDelete = (id: number) => {
    const usuario = usuarios.find(u => u.id === id)
    if (!usuario) return

    setConfirmDialog({
      open: true,
      title: "Excluir usuário permanentemente?",
      description: `Tem certeza que deseja excluir ${usuario.nome}? Esta ação é IRREVERSÍVEL e o usuário será removido do banco de dados.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/usuarios/${id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            // Remover usuário da lista localmente
            setUsuarios(prevUsuarios =>
              prevUsuarios.filter(u => u.id !== id)
            )
            
            toast({
              title: "🗑️ Usuário excluído",
              description: `${usuario.nome} foi removido permanentemente do banco de dados.`,
            })
          } else {
            const error = await response.json()
            toast({
              title: "❌ Não foi possível excluir",
              description: error.error || "Erro ao excluir usuário",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Erro:", error)
          toast({
            title: "❌ Erro",
            description: "Erro ao excluir usuário",
            variant: "destructive",
          })
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }))
        }
      },
    })
  }

  const handleLerRFID = () => {
    // Criar nova sessão para leitura de RFID
    const newSessionId = `cadastro_usuario_${Date.now()}`
    setRfidSessionId(newSessionId)
    setIsReadingRFID(true)
    setRfidMessage("🔍 Aguardando leitura do cartão RFID... Aproxime o cartão do leitor.")
    
    // Timeout de 30 segundos
    setTimeout(() => {
      if (isReadingRFID && !cardId) {
        setIsReadingRFID(false)
        setRfidSessionId(null)
        setRfidMessage("⏱️ Tempo esgotado. Tente novamente.")
        setTimeout(() => setRfidMessage(""), 3000)
      }
    }, 30000)
  }

  const handleCancelarLeitura = () => {
    setIsReadingRFID(false)
    setRfidSessionId(null)
    setRfidMessage("")
  }

  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.ativo).length,
    inativos: usuarios.filter(u => !u.ativo).length,
    professores: usuarios.filter(u => u.tipo === "professor").length,
  }

  return (
    <AdminLayout title="Gerenciamento de Usuários">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Usuários e Professores</h1>
            <p className="text-slate-600 mt-2">Gerencie credenciais, RFID e acesso de usuários</p>
          </div>
          
          <Button 
            className="bg-[#132B1E] hover:bg-[#132B1E]/90 text-[#B39C66] shadow-lg gap-2"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-5 h-5" />
                Novo Usuário
              </Button>
                </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <p className="text-sm text-slate-600">Total de Usuários</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-sm text-green-100">Ativos</p>
            <p className="text-3xl font-bold mt-2">{stats.ativos}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-slate-500 to-slate-600 text-white">
            <p className="text-sm text-slate-100">Inativos</p>
            <p className="text-3xl font-bold mt-2">{stats.inativos}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-[#132B1E] to-[#1a3d2b] text-white">
            <p className="text-sm text-[#B39C66]">Professores</p>
            <p className="text-3xl font-bold mt-2">{stats.professores}</p>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-6">
        <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar por nome, email ou RFID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-48">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="professor">Professor</SelectItem>
              <SelectItem value="aluno">Aluno</SelectItem>
              <SelectItem value="tecnico">Técnico</SelectItem>
              <SelectItem value="visitante">Visitante</SelectItem>
            </SelectContent>
          </Select>
        </div>

          {/* Tabela */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Nome</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">E-mail</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">RFID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Último Acesso</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Ações</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{usuario.nome}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {usuario.tipo}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{usuario.email || "—"}</td>
                      <td className="px-6 py-4">
                        {usuario.tag_uid ? (
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                            {usuario.tag_uid}
                          </code>
                        ) : (
                          <span className="text-sm text-slate-400">Sem cartão</span>
                        )}
                    </td>
                      <td className="px-6 py-4">
                        {usuario.ativo ? (
                          <Badge className="bg-green-500 text-white gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-400 text-slate-600 gap-1">
                            <XCircle className="w-3 h-3" />
                            Inativo
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {usuario.ultimo_acesso 
                          ? new Date(usuario.ultimo_acesso).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(usuario)}
                          >
                            <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                            variant="outline"
                        size="sm"
                            onClick={() => handleToggleStatus(usuario.id, usuario.ativo || false)}
                            className={usuario.ativo ? "" : "bg-green-50 border-green-200 text-green-700"}
                          >
                            {usuario.ativo ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => handleDelete(usuario.id)}
                      >
                            <Trash2 className="w-4 h-4" />
                      </Button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>

          {filteredUsuarios.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-slate-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </Card>

        {/* Dialog de Cadastro/Edição */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? "Atualize as informações do usuário" : "Cadastre um novo usuário no sistema"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: João da Silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@fecap.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Usuário *</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">👨‍🏫 Professor</SelectItem>
                    <SelectItem value="aluno">🎓 Aluno</SelectItem>
                    <SelectItem value="tecnico">🔧 Técnico</SelectItem>
                    <SelectItem value="visitante">👤 Visitante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* RFID */}
              <div className="space-y-2">
                <Label htmlFor="tag_uid">Cartão RFID</Label>
                <div className="flex gap-2">
                  <Input
                    id="tag_uid"
                    placeholder="UID do cartão RFID"
                    value={formData.tag_uid}
                    onChange={(e) => setFormData({ ...formData, tag_uid: e.target.value })}
                    className="font-mono text-sm"
                    disabled={isReadingRFID}
                  />
                  {!isReadingRFID ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLerRFID}
                      className="gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Ler Cartão
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelarLeitura}
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
                
                {/* Status da Leitura */}
                {isReadingRFID && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Aguardando cartão ...</p>
                      <p className="text-xs text-blue-600">
                        {isConnected ? "🟢 Conectado ao leitor" : "🟡 Conectando..."}
                      </p>
                    </div>
                  </div>
                )}
                
                {rfidMessage && !isReadingRFID && (
                  <div className={`p-3 rounded-lg border ${
                    rfidMessage.includes("✅") 
                      ? "bg-green-50 border-green-200" 
                      : rfidMessage.includes("❌") 
                      ? "bg-red-50 border-red-200" 
                      : "bg-yellow-50 border-yellow-200"
                  }`}>
                    <p className={`text-sm font-medium ${
                      rfidMessage.includes("✅") ? "text-green-900" : 
                      rfidMessage.includes("❌") ? "text-red-900" : 
                      "text-yellow-900"
                    }`}>
                      {rfidMessage}
                    </p>
                  </div>
                )}
                
                {!isReadingRFID && !rfidMessage && (
                  <p className="text-xs text-slate-500">
                    💡 Aproxime o cartão no leitor ou digite manualmente
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-[#132B1E] hover:bg-[#132B1E]/90 text-[#B39C66]"
                disabled={!formData.nome || !formData.tipo}
              >
                {editingUser ? "Salvar Alterações" : "Cadastrar Usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          variant="destructive"
          confirmText="Confirmar"
          cancelText="Cancelar"
        />
      </div>
    </AdminLayout>
  )
}
