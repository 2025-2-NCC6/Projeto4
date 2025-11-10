"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, X } from "lucide-react"

interface RequestCard {
  id: number
  room: string
  building: string
  type: string
  requester: string
  date: string
  status: "pending" | "approved" | "rejected"
}

const initialRequests: RequestCard[] = [
  {
    id: 1,
    room: "Sala 203",
    building: "Prédio B",
    type: "Lab Info",
    requester: "Prof. Ana",
    date: "01/11/2025",
    status: "pending",
  },
  {
    id: 2,
    room: "Auditório",
    building: "Prédio C",
    type: "Palestra",
    requester: "Prof. Carlos",
    date: "31/10/2025",
    status: "pending",
  },
  {
    id: 3,
    room: "Lab Info 01",
    building: "Prédio A",
    type: "Aula Prática",
    requester: "Prof. Marina",
    date: "30/10/2025",
    status: "approved",
  },
  {
    id: 4,
    room: "Sala 105",
    building: "Prédio A",
    type: "Seminário",
    requester: "Prof. João",
    date: "29/10/2025",
    status: "rejected",
  },
]

export default function SolicitacoesPage() {
  const [requests, setRequests] = useState<RequestCard[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<RequestCard | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [sendEmail, setSendEmail] = useState(true)

  const handleApprove = (id: number) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)))
  }

  const handleReject = (id: number) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)))
    setRejectReason("")
    setSelectedRequest(null)
  }

  const pending = requests.filter((r) => r.status === "pending")
  const approved = requests.filter((r) => r.status === "approved")
  const rejected = requests.filter((r) => r.status === "rejected")

  const KanbanColumn = ({
    title,
    items,
    statusType,
  }: { title: string; items: RequestCard[]; statusType: "pending" | "approved" | "rejected" }) => (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{items.length} solicitações</p>
      </div>
      <div className="space-y-3 flex-1">
        {items.map((request) => (
          <Card key={request.id} className="border border-border cursor-pointer hover:shadow-md transition">
            <CardContent className="p-4">
              <p className="font-semibold text-sm text-foreground">
                {request.room} - {request.building}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{request.type}</p>
              <p className="text-xs text-muted-foreground">Solicitante: {request.requester}</p>
              <p className="text-xs text-muted-foreground mt-2">{request.date}</p>

              {statusType === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="flex-1 h-8 bg-green-600 hover:bg-green-700 text-white gap-1"
                    onClick={() => handleApprove(request.id)}
                  >
                    <Check size={14} />
                    Aprovar
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-destructive hover:text-destructive bg-transparent"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <X size={14} />
                        Recusar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Recusar Solicitação</DialogTitle>
                        <DialogDescription>Sala: {selectedRequest?.room}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Motivo da recusa</Label>
                          <Textarea
                            placeholder="Explique por que a solicitação foi recusada..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="mt-2 min-h-20"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="email"
                            checked={sendEmail}
                            onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                          />
                          <Label htmlFor="email" className="text-sm cursor-pointer">
                            Enviar e-mail automático
                          </Label>
                        </div>
                        <Button
                          className="w-full bg-destructive hover:bg-destructive/90"
                          onClick={() => {
                            if (selectedRequest) {
                              handleReject(selectedRequest.id)
                            }
                          }}
                        >
                          Confirmar Recusa
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <AdminLayout title="Solicitações de Salas">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitações Pendentes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie as solicitações de salas em sistema Kanban</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border bg-muted/30">
            <CardHeader className="pb-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{pending.length}</div>
                <p className="text-sm text-muted-foreground">Aguardando</p>
              </div>
            </CardHeader>
            <CardContent>
              <KanbanColumn title="Aguardando Aprovação" items={pending} statusType="pending" />
            </CardContent>
          </Card>

          <Card className="border border-border bg-muted/30">
            <CardHeader className="pb-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{approved.length}</div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
              </div>
            </CardHeader>
            <CardContent>
              <KanbanColumn title="Aprovadas" items={approved} statusType="approved" />
            </CardContent>
          </Card>

          <Card className="border border-border bg-muted/30">
            <CardHeader className="pb-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{rejected.length}</div>
                <p className="text-sm text-muted-foreground">Recusadas</p>
              </div>
            </CardHeader>
            <CardContent>
              <KanbanColumn title="Recusadas" items={rejected} statusType="rejected" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
