"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface ConfirmationScreenProps {
  email: string
  onReset: () => void
}

export function ConfirmationScreen({ email, onReset }: ConfirmationScreenProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#f0f7f4] via-white to-[#fffbf0] relative overflow-hidden">
      {/* Background accents - FECAP colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A86B] rounded-full blur-3xl opacity-15" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full blur-3xl opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-xl mx-auto text-center space-y-8"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.2,
          }}
          className="flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="absolute inset-0 bg-[#00A86B] rounded-full blur-xl opacity-50"
            />
            <CheckCircle2 className="w-24 h-24 text-[#00A86B] relative z-10" />
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Cadastro Realizado!</h1>
          <p className="text-lg text-slate-600 font-light">Sua inscrição foi processada com sucesso</p>
        </motion.div>

        {/* Email notification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-xl border-2 border-[#FFD700] space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-[#006241]">
            <motion.svg
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </motion.svg>
            <span className="font-semibold">Confira seu e-mail</span>
          </div>
          <p className="text-slate-600 text-center">Enviamos um link de confirmação para</p>
          <p className="text-lg font-mono text-slate-900 bg-slate-50 rounded-lg p-3 break-all">{email}</p>
          <div className="space-y-3 pt-4 border-t border-[#006241]/10">
            <p className="text-sm text-[#006241] font-medium">📋 Próximos passos:</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-[#00A86B] font-bold mt-0.5">1.</span>
                <span>Abra o e-mail recebido na sua caixa de entrada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00A86B] font-bold mt-0.5">2.</span>
                <span>Clique no link de ativação fornecido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00A86B] font-bold mt-0.5">3.</span>
                <span>Crie uma senha segura para sua conta</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-[#fffbf0] rounded-xl p-4 border-2 border-[#FFD700]/50"
        >
          <p className="text-sm text-[#006241] font-medium">
            💡 <span className="font-semibold">Dica:</span> Se não receber o e-mail em poucos minutos, verifique sua
            pasta de spam
          </p>
        </motion.div>

        {/* Reset Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="pt-4"
        >
          <Button
            onClick={onReset}
            size="lg"
            className="px-10 py-7 text-lg font-semibold rounded-full bg-gradient-to-r from-[#006241] to-[#00A86B] hover:from-[#004d33] hover:to-[#008659] text-white shadow-xl hover:shadow-2xl hover:shadow-[#006241]/30 transition-all duration-300 transform hover:scale-105"
          >
            ← Voltar ao Início
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
