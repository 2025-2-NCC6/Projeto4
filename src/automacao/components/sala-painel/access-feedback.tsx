"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"

type AccessResult = "liberado" | "negado"

export function AccessFeedback({ result }: { result: AccessResult }) {
  const isGranted = result === "liberado"

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex flex-col items-center justify-center"
    >
      {/* Fundo com pulso */}
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          className={`absolute inset-0 -m-20 rounded-full ${
            isGranted ? "bg-green-500" : "bg-red-500"
          }`}
        />

        {/* Ícone Principal */}
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className={`w-48 h-48 rounded-full flex items-center justify-center ${
            isGranted
              ? "bg-gradient-to-br from-green-500 to-green-600"
              : "bg-gradient-to-br from-red-500 to-red-600"
          } shadow-2xl ${isGranted ? "shadow-green-500/50" : "shadow-red-500/50"}`}
        >
          {isGranted ? (
            <CheckCircle2 className="w-24 h-24 text-white" strokeWidth={3} />
          ) : (
            <XCircle className="w-24 h-24 text-white" strokeWidth={3} />
          )}
        </motion.div>
      </div>

      {/* Texto */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <h2
          className={`text-6xl font-black tracking-wider mb-4 ${
            isGranted ? "text-green-400" : "text-red-400"
          }`}
        >
          {isGranted ? "ACESSO LIBERADO" : "ACESSO NEGADO"}
        </h2>
        <p className="text-2xl text-white/70 font-medium">
          {isGranted
            ? "Bem-vindo! Entrada registrada com sucesso."
            : "Você não possui permissão para acessar esta sala."}
        </p>
      </motion.div>

      {/* Barra de progresso de retorno */}
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={`mt-12 h-2 rounded-full ${isGranted ? "bg-green-500" : "bg-red-500"}`}
        style={{ maxWidth: "400px" }}
      />
    </motion.div>
  )
}

