"use client"

import { motion } from "framer-motion"
import { Radio } from "lucide-react"

export function RFIDReader({ isConnected }: { isConnected: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-col items-center justify-center py-12"
    >
      {/* RFID Icon Central */}
      <div className="relative">
        {/* Ondas de pulso */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 -m-12 rounded-full border-4 border-teal-500"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute inset-0 -m-16 rounded-full border-4 border-teal-400"
        />

        {/* Ícone Central */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-32 h-32 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/50"
        >
          <Radio className="w-16 h-16 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Círculo externo */}
        <div className="absolute inset-0 -m-4 rounded-full border-2 border-teal-500/30" />
      </div>

      {/* Texto de instrução */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-2xl font-semibold text-white/90">Aproxime seu cartão</p>
        <p className="text-lg text-white/60 mt-2">para registrar acesso</p>
      </motion.div>

      {/* Indicador de conexão */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 flex items-center gap-2"
      >
        <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        <span className="text-sm text-white/70 font-medium">
          {isConnected ? "Leitor conectado" : "Leitor desconectado"}
        </span>
      </motion.div>
    </motion.div>
  )
}

