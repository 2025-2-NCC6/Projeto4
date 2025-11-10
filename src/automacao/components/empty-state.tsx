"use client"

import { AlertCircle, FileText, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: "alerts" | "messages" | "users" | "calendar"
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon = "alerts", title, description, action }: EmptyStateProps) {
  const iconMap = {
    alerts: AlertCircle,
    messages: FileText,
    users: Users,
    calendar: Calendar,
  }

  const Icon = iconMap[icon]

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="gap-2 bg-primary hover:bg-primary/90">
          {action.label}
        </Button>
      )}
    </div>
  )
}
