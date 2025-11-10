"use client"

import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "active" | "inactive" | "maintenance" | "pending" | "approved" | "rejected"
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    active: { bg: "bg-green-100", text: "text-green-800", label: label || "Ativo" },
    inactive: { bg: "bg-gray-100", text: "text-gray-800", label: label || "Inativo" },
    maintenance: { bg: "bg-blue-100", text: "text-blue-800", label: label || "Manutenção" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: label || "Pendente" },
    approved: { bg: "bg-green-100", text: "text-green-800", label: label || "Aprovado" },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: label || "Recusado" },
  }

  const config = statusConfig[status]

  return <Badge className={`${config.bg} ${config.text} border-0 font-medium`}>{config.label}</Badge>
}
