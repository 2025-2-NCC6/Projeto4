"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RFIDReader } from "./rfid-reader"
import { SalaHeader } from "./sala-header"
import { SalaStatus } from "./sala-status"
import { ProximaReserva } from "./proxima-reserva"
import { AccessFeedback } from "./access-feedback"
import { Footer } from "./footer"
import { useRFIDStream } from "@/hooks/use-rfid-stream"

type SalaData = {
  id: number
  nome: string
  tipo: string
  predio: string
  status: "livre" | "em_aula" | "reservada" | "manutencao"
  proximaReserva?: {
    professor: string
    horarioInicio: string
    horarioFim: string
  }
}

type AccessResult = "liberado" | "negado" | null

export function SalaPainel({ salaData }: { salaData: SalaData }) {
  const [sessionId] = useState(() => `sala_${salaData.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`)
  const { cardId, isConnected } = useRFIDStream(sessionId, true)
  const [accessResult, setAccessResult] = useState<AccessResult>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const isProcessingRef = useRef(false)
  const lastProcessedCardRef = useRef<string | null>(null)

  // Atualiza relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Processa leitura de cartão (apenas uma vez por cardId)
  useEffect(() => {
    // Proteções múltiplas contra loop
    if (!cardId) return
    if (cardId === lastProcessedCardRef.current) return
    if (isProcessingRef.current) return
    if (accessResult !== null) return

    console.log(`💳 [SALA-PAINEL] Cartão ${cardId} detectado na sala ${salaData.nome}`)
    
    // Marca como processando
    isProcessingRef.current = true
    lastProcessedCardRef.current = cardId
    
    const processAccess = async () => {
      try {
        console.log(`🔐 [SALA-PAINEL] Verificando acesso para card ${cardId}...`)
        
        const response = await fetch("/api/acesso-sala", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salaId: salaData.id,
            cardId,
            tipo: "entrada",
          }),
        })

        const result = await response.json()

        if (result.success) {
          setAccessResult("liberado")
          console.log(`✅ [SALA-PAINEL] ACESSO LIBERADO - ${result.data.usuario.nome}`)
        } else {
          setAccessResult("negado")
          console.log(`❌ [SALA-PAINEL] ACESSO NEGADO - ${result.error}`)
        }

        // Retorna ao estado normal após 5 segundos
        setTimeout(() => {
          console.log(`🔄 [SALA-PAINEL] Resetando painel...`)
          setAccessResult(null)
          isProcessingRef.current = false
          // Limpa após mais 2 segundos para aceitar novo card
          setTimeout(() => {
            lastProcessedCardRef.current = null
          }, 2000)
        }, 5000)
      } catch (error) {
        console.error("[SALA-PAINEL] Erro ao processar acesso:", error)
        setAccessResult("negado")
        setTimeout(() => {
          setAccessResult(null)
          isProcessingRef.current = false
          setTimeout(() => {
            lastProcessedCardRef.current = null
          }, 2000)
        }, 5000)
      }
    }

    processAccess()
    
    // Cleanup se componente desmontar durante processamento
    return () => {
      if (isProcessingRef.current) {
        console.log(`⚠️ [SALA-PAINEL] Componente desmontado durante processamento`)
        isProcessingRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden font-poppins">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-repeat" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <SalaHeader sala={salaData} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 space-y-12">
          <AnimatePresence mode="wait">
            {accessResult ? (
              <AccessFeedback key="feedback" result={accessResult} />
            ) : (
              <motion.div
                key="normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-4xl space-y-12"
              >
                {/* Status Principal */}
                <SalaStatus status={salaData.status} />

                {/* RFID Reader Animation */}
                <RFIDReader isConnected={isConnected} />

                {/* Próxima Reserva */}
                {salaData.proximaReserva && (
                  <ProximaReserva reserva={salaData.proximaReserva} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <Footer currentTime={currentTime} isConnected={isConnected} />
      </div>
    </div>
  )
}

