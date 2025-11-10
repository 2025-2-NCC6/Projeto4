"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Clock, AlertTriangle, Wrench } from "lucide-react"

type StatusType = "livre" | "em_aula" | "reservada" | "manutencao"

const statusConfig = {
  livre: {
    label: "LIVRE",
    color: "from-green-600 to-green-500",
    bg: "bg-green-500/20",
    border: "border-green-500",
    icon: CheckCircle2,
    textColor: "text-green-400",
    pulseColor: "bg-green-500",
  },
  em_aula: {
    label: "EM AULA",
    color: "from-blue-600 to-blue-500",
    bg: "bg-blue-500/20",
    border: "border-blue-500",
    icon: Clock,
    textColor: "text-blue-400",
    pulseColor: "bg-blue-500",
  },
  reservada: {
    label: "RESERVADA",
    color: "from-yellow-600 to-yellow-500",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500",
    icon: AlertTriangle,
    textColor: "text-yellow-400",
    pulseColor: "bg-yellow-500",
  },
  manutencao: {
    label: "MANUTENÇÃO",
    color: "from-gray-600 to-gray-500",
    bg: "bg-gray-500/20",
    border: "border-gray-500",
    icon: Wrench,
    textColor: "text-gray-400",
    pulseColor: "bg-gray-500",
  },
}

export function SalaStatus({ status }: { status: StatusType }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="text-center"
    >
      <div className="relative inline-flex flex-col items-center">
        {/* Pulse Background */}
        <div className="absolute -inset-8">
          <div className={`absolute inset-0 ${config.pulseColor} opacity-20 rounded-full animate-pulse`} />
          <div
            className={`absolute inset-0 ${config.pulseColor} opacity-10 rounded-full animate-ping`}
            style={{ animationDuration: "2s" }}
          />
        </div>

        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-32 h-32 rounded-full ${config.bg} ${config.border} border-4 flex items-center justify-center mb-6 relative z-10`}
        >
          <Icon className={`w-16 h-16 ${config.textColor}`} strokeWidth={2.5} />
        </motion.div>

        {/* Status Label */}
        <div className={`bg-gradient-to-r ${config.color} px-12 py-4 rounded-2xl shadow-2xl relative z-10`}>
          <h2 className="text-6xl font-black text-white tracking-wider drop-shadow-lg">{config.label}</h2>
        </div>
      </div>
    </motion.div>
  )
}

