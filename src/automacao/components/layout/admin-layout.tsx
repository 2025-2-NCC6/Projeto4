"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Toaster } from "@/components/ui/toaster"
import { useSidebar } from "@/contexts/sidebar-context"

interface AdminLayoutProps {
  children: ReactNode
  title: string
  systemStatus?: "online" | "offline"
}

export function AdminLayout({ children, title, systemStatus }: AdminLayoutProps) {
  const { sidebarWidth } = useSidebar()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} systemStatus={systemStatus} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
