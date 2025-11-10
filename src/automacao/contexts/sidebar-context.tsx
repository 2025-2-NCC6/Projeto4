"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SidebarContextType {
  isPinned: boolean
  isCollapsed: boolean
  isMobileOpen: boolean
  togglePin: () => void
  setIsCollapsed: (value: boolean) => void
  setIsMobileOpen: (value: boolean) => void
  sidebarWidth: number
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isPinned, setIsPinned] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Calcular largura do sidebar
  const sidebarWidth = isCollapsed ? 80 : 280

  const togglePin = () => {
    setIsPinned(!isPinned)
    if (isPinned) {
      // Ao desafixar, colapsa automaticamente
      setIsCollapsed(true)
    } else {
      // Ao fixar, expande automaticamente
      setIsCollapsed(false)
    }
  }

  // Fechar menu mobile ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        isPinned,
        isCollapsed,
        isMobileOpen,
        togglePin,
        setIsCollapsed,
        setIsMobileOpen,
        sidebarWidth,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

