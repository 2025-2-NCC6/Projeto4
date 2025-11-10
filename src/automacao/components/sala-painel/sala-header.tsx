"use client"

import { motion } from "framer-motion"
import { Building2, DoorOpen } from "lucide-react"

type SalaData = {
  nome: string
  tipo: string
  predio: string
}

const tipoLabels: Record<string, string> = {
  aula: "Sala de Aula",
  lab_info: "Laboratório de Informática",
  lab_make: "Laboratório Maker",
  meet: "Sala de Reunião",
  teatro: "Auditório",
}

export function SalaHeader({ sala }: { sala: SalaData }) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-fecap-green via-fecap-green-light to-fecap-green px-8 py-6 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Nome */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <DoorOpen className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">{sala.nome}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/90 text-lg font-medium flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Prédio {sala.predio}
              </span>
              <span className="text-white/70">•</span>
              <span className="text-white/90 text-lg">{tipoLabels[sala.tipo] || sala.tipo}</span>
            </div>
          </div>
        </div>

        {/* Logo FECAP */}
        <div className="text-right">
          <div className="text-3xl font-bold text-white tracking-wider">FECAP</div>
          <div className="text-sm text-white/80 font-medium">Sistema de Acesso</div>
        </div>
      </div>
    </motion.header>
  )
}

