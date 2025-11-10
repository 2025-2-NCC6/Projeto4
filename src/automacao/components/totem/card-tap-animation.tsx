"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRFIDStream } from "@/hooks/use-rfid-stream"
import { useToast } from "@/hooks/use-toast"

interface CardTapAnimationProps {
  data: {
    name: string
    email: string
    type: string
  }
  onComplete: () => void
  userId?: number | null
}

export function CardTapAnimation({ data, onComplete, userId }: CardTapAnimationProps) {
  const [isComplete, setIsComplete] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`)
  const { toast } = useToast()

  // Hook para escutar eventos RFID via SSE
  const { cardId, isConnected, error, isListening } = useRFIDStream(sessionId, true)

  // Processa card lido
  useEffect(() => {
    if (!cardId) return

    console.log(`💳 Card detectado: ${cardId}`)

    const bindCard = async () => {
      if (!userId) {
        console.warn("⚠️ UserId não disponível, pulando vinculação")
      setIsComplete(true)
      setTimeout(onComplete, 2000)
        return
      }

      try {
        // Vincula card ao usuário
        const response = await fetch("/api/rfid/bind", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, cardId }),
        })

        const result = await response.json()

        if (!response.ok) {
          // Se cartão já está vinculado, deletar o usuário recém-criado
          if (result.shouldDeleteUser || result.error?.includes("vinculado")) {
            console.log("🗑️ Cartão já vinculado. Removendo cadastro duplicado...")
            
            // Deleta o usuário que acabou de ser criado
            const deleteResponse = await fetch(`/api/registrations/${userId}`, {
              method: "DELETE",
            })

            if (deleteResponse.ok) {
              console.log("✅ Cadastro duplicado removido com sucesso")
            }

            toast({
              variant: "destructive",
              title: "❌ Cartão já cadastrado",
              description: "Este cartão já pertence a outro usuário. Seu cadastro foi cancelado automaticamente.",
              duration: 8000,
            })
          } else {
            toast({
              variant: "destructive",
              title: "Erro ao vincular cartão",
              description: result.error || "Não foi possível vincular o cartão.",
            })
          }
        } else {
          console.log("✅ Cartão vinculado:", result.data)
          
          toast({
            title: "✅ Cadastro completo!",
            description: "Seu cartão foi vinculado com sucesso.",
            duration: 3000,
          })
        }
      } catch (err) {
        console.error("❌ Erro ao vincular card:", err)
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível comunicar com o servidor.",
        })
      } finally {
        setIsComplete(true)
        setTimeout(onComplete, 2000)
      }
    }

    bindCard()
  }, [cardId, userId, onComplete, toast])

  // Trata erros
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro na leitura",
        description: error,
        duration: 5000,
      })
    }
  }, [error, toast])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#f0f7f4] via-white to-[#fffbf0] overflow-hidden relative">
      {/* Background accents - FECAP colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006241] rounded-full blur-3xl opacity-15" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full blur-3xl opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 max-w-lg">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-bold text-slate-900">
            {isComplete ? "Cartão Lido!" : isConnected ? "Aproxime seu Cartão" : "Conectando..."}
          </h1>
          <p className="text-slate-600 text-lg">
            {isComplete
              ? "Seu cadastro foi processado com sucesso"
              : isConnected
                ? "Aguardando leitura do cartão no totem"
                : "Estabelecendo conexão com o leitor"}
          </p>
        </motion.div>

        {/* Card Reader Animation */}
        <div className="relative w-80 h-64 flex items-center justify-center">
          {/* Reader Device */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute z-20 w-72 h-56 bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl border-4 border-slate-700 flex items-center justify-center"
          >
            {/* Screen inside reader */}
            <div className="w-64 h-48 bg-gradient-to-b from-[#00A86B] to-[#006241] rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
              <span className="text-[#FFD700] text-lg font-bold relative z-10 drop-shadow-lg">
                {isComplete ? "✓ LIDO" : "AGUARDANDO..."}
              </span>
            </div>
          </motion.div>

          {/* Card approaching animation */}
          <motion.div
            initial={{ x: -300, y: -200, rotateZ: -25, opacity: 0 }}
            animate={
              isComplete
                ? { x: 0, y: 0, rotateZ: 0, opacity: 1 }
                : {
                    x: [-300, -100, 0],
                    y: [-200, -80, 0],
                    rotateZ: [-25, -15, 0],
                    opacity: [0, 0.7, 1],
                  }
            }
            transition={
              isComplete
                  ? { duration: 0.6, delay: 0.5 }
                : { duration: 2.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }
            }
            className="absolute w-48 h-32 bg-gradient-to-br from-[#006241] to-[#004d33] rounded-lg shadow-xl border-4 border-[#FFD700] flex items-center justify-center flex-col z-30"
          >
              <div className="text-[#FFD700] text-sm font-bold drop-shadow-md">{cardId || "CARD ID"}</div>
            <div className="text-white text-xs font-mono mt-2">{data.type.toUpperCase()}</div>
          </motion.div>

          {/* Scan lines effect */}
          {!isComplete && (
            <motion.div
              animate={{ y: [0, 200, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="absolute w-72 h-1 bg-gradient-to-r from-transparent via-[#00A86B] to-transparent z-10 left-4 shadow-lg shadow-[#00A86B]/50"
            />
          )}

          {/* Success pulse */}
          {isComplete && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 50 }}
                className="absolute w-96 h-96 border-2 border-[#00A86B] rounded-full z-10 shadow-lg shadow-[#00A86B]/30"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
                className="absolute w-96 h-96 border-2 border-[#FFD700] rounded-full opacity-70 z-10"
              />
            </>
          )}
        </div>

        {/* User Info Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full bg-white rounded-xl p-6 shadow-lg border border-slate-100 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Dados Registrados</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-600">Nome:</span>
              <span className="font-semibold text-slate-900">{data.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-600">E-mail:</span>
              <span className="font-semibold text-slate-900 truncate">{data.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Tipo:</span>
              <span className="font-semibold text-slate-900 px-3 py-1 bg-[#f0f7f4] text-[#006241] rounded-full text-sm border border-[#006241]/20">
                {data.type === "aluno"
                  ? "Aluno"
                  : data.type === "professor"
                    ? "Professor"
                    : data.type === "tecnico"
                      ? "Técnico"
                      : "Visitante"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Status indicator */}
        {!isComplete && (
          <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 border-4 border-slate-200 border-t-[#00A86B] rounded-full"
          />
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}
              />
              <p className="text-sm text-slate-600 font-medium">
                {isListening ? "Aguardando cartão..." : isConnected ? "Conectado" : "Conectando ao leitor..."}
              </p>
            </div>
          </div>
        )}

        {/* Card ID display when complete */}
        {isComplete && cardId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#006241] to-[#00A86B] text-white px-6 py-3 rounded-full shadow-lg border-2 border-[#FFD700]"
          >
            <p className="text-sm font-semibold">Cartão: {cardId}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
