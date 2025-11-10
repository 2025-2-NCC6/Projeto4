"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, User } from "lucide-react"

type Reserva = {
  professor: string
  horarioInicio: string
  horarioFim: string
}

export function ProximaReserva({ reserva }: { reserva: Reserva }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-fecap-green/20 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-fecap-green-light" />
        </div>
        <h3 className="text-2xl font-bold text-white">Próxima Reserva</h3>
      </div>

      <div className="space-y-4">
        {/* Professor */}
        <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
          <div className="w-10 h-10 bg-fecap-green/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-fecap-green-light" />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Professor(a)</p>
            <p className="text-xl font-bold text-white">{reserva.professor}</p>
          </div>
        </div>

        {/* Horário */}
        <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-white/60 font-medium">Horário</p>
            <p className="text-xl font-bold text-white">
              {reserva.horarioInicio} - {reserva.horarioFim}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

