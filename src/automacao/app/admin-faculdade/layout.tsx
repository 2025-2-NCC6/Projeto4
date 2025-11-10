"use client"

import { SidebarProvider } from "@/contexts/sidebar-context"
import { ReactNode } from "react"

export default function AdminFaculdadeLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}

