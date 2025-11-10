"use client"

import { motion } from "framer-motion"
import { Wifi, WifiOff } from "lucide-react"

export function Footer({ currentTime, isConnected }: { currentTime: Date; isConnected: boolean }) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-900/50 backdrop-blur-sm border-t border-white/10 px-8 py-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Data e Hora */}
        <div className="space-y-1">
          <div className="text-4xl font-bold text-white tabular-nums tracking-tight">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-white/60 font-medium capitalize">{formatDate(currentTime)}</div>
        </div>

        {/* Status de Conexão */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-white/80 text-lg font-medium">
              {isConnected ? "Sistema Online" : "Sistema Offline"}
            </span>
          </div>
          {isConnected ? (
            <Wifi className="w-6 h-6 text-green-500" />
          ) : (
            <WifiOff className="w-6 h-6 text-red-500" />
          )}
        </div>
      </div>
    </motion.footer>
  )
}

