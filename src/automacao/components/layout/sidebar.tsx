"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Home,
  Building2,
  ClipboardList,
  Users,
  Activity,
  Menu,
  X,
  Pin,
  PinOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useSidebar } from "@/contexts/sidebar-context"

const menuItems = [
  { 
    label: "Dashboard", 
    href: "/admin-faculdade/dashboard", 
    icon: Home,
    category: "principal"
  },
  { 
    label: "Gestão de Salas", 
    href: "/admin-faculdade/salas", 
    icon: Building2,
    category: "principal"
  },
  { 
    label: "Planejamento e Reservas", 
    href: "/admin-faculdade/planejamento-reservas", 
    icon: ClipboardList,
    category: "principal"
  },
  { 
    label: "Usuários", 
    href: "/admin-faculdade/usuarios", 
    icon: Users,
    category: "gestao"
  },
  { 
    label: "Solicitações", 
    href: "/admin-faculdade/solicitacoes", 
    icon: ClipboardList,
    category: "gestao"
  },
  { 
    label: "Dashboard de Energia", 
    href: "/admin-faculdade/alertas", 
    icon: Activity,
    category: "sistema"
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isPinned, isCollapsed, isMobileOpen, togglePin, setIsCollapsed, setIsMobileOpen } = useSidebar()

  return (
    <>
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden fixed top-4 left-4 z-40 bg-[#132B1E] text-[#B39C66] hover:bg-[#132B1E]/90" 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => {
          if (!isPinned) setIsCollapsed(false)
        }}
        onMouseLeave={() => {
          if (!isPinned) setIsCollapsed(true)
        }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-[#132B1E] border-r border-[#B39C66]/30 transition-all duration-300 z-30 lg:z-auto shadow-2xl",
          "lg:relative lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#B39C66]/20">
          <AnimatePresence mode="wait">
            {!isCollapsed || isMobileOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Image
                  src="/logo-enerSave2.png"
                  alt="EnerSave FECAP Logo"
                  width={100}
                  height={60}
                  className="object-contain"
                  priority
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <Image
                  src="/logo-enerSave.png"
                  alt="EnerSave FECAP Icon"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 p-4 space-y-6",
          isCollapsed ? "overflow-hidden" : "overflow-y-auto"
        )}>
          {/* Seção Principal */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-4 text-xs font-bold text-[#B39C66]/50 uppercase tracking-wider mb-3">
                Principal
              </p>
            )}
            {menuItems.filter(item => item.category === "principal").map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group",
                      isActive
                        ? "bg-[#B39C66] text-[#132B1E] shadow-lg shadow-[#B39C66]/20"
                        : "text-[#B39C66]/80 hover:bg-[#B39C66]/10 hover:text-[#B39C66]"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                    
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {/* Indicador de ativo */}
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-[#132B1E] rounded-full"
                      />
                    )}
                    
                    {/* Tooltip para modo collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-[#132B1E] text-[#B39C66] text-sm rounded-lg shadow-xl border border-[#B39C66]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Divisor */}
          {!isCollapsed && <div className="border-t border-[#B39C66]/10" />}
          {isCollapsed && <div className="h-px bg-[#B39C66]/10 mx-4" />}

          {/* Seção Gestão */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-4 text-xs font-bold text-[#B39C66]/50 uppercase tracking-wider mb-3">
                Gestão
              </p>
            )}
            {menuItems.filter(item => item.category === "gestao").map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group",
                      isActive
                        ? "bg-[#B39C66] text-[#132B1E] shadow-lg shadow-[#B39C66]/20"
                        : "text-[#B39C66]/80 hover:bg-[#B39C66]/10 hover:text-[#B39C66]"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                    
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-[#132B1E] rounded-full"
                      />
                    )}
                    
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-[#132B1E] text-[#B39C66] text-sm rounded-lg shadow-xl border border-[#B39C66]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Divisor */}
          {!isCollapsed && <div className="border-t border-[#B39C66]/10" />}
          {isCollapsed && <div className="h-px bg-[#B39C66]/10 mx-4" />}

          {/* Seção Sistema */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-4 text-xs font-bold text-[#B39C66]/50 uppercase tracking-wider mb-3">
                Sistema
              </p>
            )}
            {menuItems.filter(item => item.category === "sistema").map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group",
                      isActive
                        ? "bg-[#B39C66] text-[#132B1E] shadow-lg shadow-[#B39C66]/20"
                        : "text-[#B39C66]/80 hover:bg-[#B39C66]/10 hover:text-[#B39C66]"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                    
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-[#132B1E] rounded-full"
                      />
                    )}
                    
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-[#132B1E] text-[#B39C66] text-sm rounded-lg shadow-xl border border-[#B39C66]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer - Botão Fixar/Desafixar */}
        <div className="p-4 border-t border-[#B39C66]/20">
          <Button
            variant="ghost"
            onClick={togglePin}
            className={cn(
              "w-full gap-3 hover:bg-[#B39C66]/10 text-[#B39C66]/80 hover:text-[#B39C66] transition-all",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            title={isPinned ? "Desafixar menu (abre no hover)" : "Fixar menu (sempre aberto)"}
          >
            {isPinned ? (
              <>
                <Pin className="w-5 h-5" strokeWidth={2.5} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                    >
                      Menu Fixado
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                <PinOff className="w-5 h-5" strokeWidth={2.5} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                    >
                      Hover para Abrir
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </Button>
        </div>
      </motion.aside>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}
    </>
  )
}
