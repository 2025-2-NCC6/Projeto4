"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Calendar, 
  CalendarPlus, 
  AlertTriangle, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import Image from "next/image"

interface UserLayoutProps {
  children: ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname()
  const { usuario, logout } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { label: "Início", icon: Home, href: "/usuario/dashboard" },
    { label: "Minhas Reservas", icon: Calendar, href: "/usuario/minhas-reservas" },
    { label: "Solicitar Reserva", icon: CalendarPlus, href: "/usuario/solicitar-reserva" },
    { label: "Reportar Problema", icon: AlertTriangle, href: "/usuario/problemas" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-gradient-to-b from-[#132B1E] to-[#0a1912] text-white shadow-2xl">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8 border-b border-white/10">
            <Image
              src="/logo-enerSave2.png"
              alt="EnerSave Logo"
              width={180}
              height={60}
              className="object-contain"
            />
          </div>

          {/* User Info */}
          {usuario && (
            <div className="px-6 py-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#B39C66] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-[#132B1E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{usuario.nome}</p>
                  <p className="text-xs text-white/70 truncate">{usuario.curso}</p>
                  <p className="text-xs text-[#B39C66]">{usuario.periodo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#B39C66] text-[#132B1E] shadow-lg"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <Button
              onClick={logout}
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#132B1E] shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <Image
            src="/logo-enerSave2.png"
            alt="EnerSave Logo"
            width={120}
            height={40}
            className="object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:bg-white/10"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#132B1E] border-t border-white/10 shadow-xl">
            {/* User Info Mobile */}
            {usuario && (
              <div className="px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B39C66] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#132B1E]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{usuario.nome}</p>
                    <p className="text-xs text-white/70">{usuario.curso}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="px-4 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#B39C66] text-[#132B1E]"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
              
              <Button
                onClick={() => {
                  logout()
                  setIsMobileMenuOpen(false)
                }}
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 mt-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:pl-72 pt-20 lg:pt-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

