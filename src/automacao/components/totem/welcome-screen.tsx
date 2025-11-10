"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { Sparkles, DoorOpen, UserPlus, Zap } from "lucide-react"

interface WelcomeScreenProps {
  onNewRegistration: () => void
  onAlreadyRegistered: () => void
}

export function WelcomeScreen({ onNewRegistration, onAlreadyRegistered }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#f0f7f4] via-white to-[#fffbf0] relative overflow-hidden">
      {/* Background decorative elements - FECAP colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Green accent - top right */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#006241] rounded-full blur-3xl" 
        />
        {/* Gold accent - bottom left */}
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#FFD700] rounded-full blur-3xl" 
        />
        {/* Light green accent - middle */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#00A86B] rounded-full blur-3xl opacity-10" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-3xl mx-auto text-center space-y-10"
      >
        {/* Logo and Brand Section */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center gap-6 mb-4"
        >
          {/* Logo Container with enhanced styling */}
          <div className="relative">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(0, 98, 65, 0.2)",
                  "0 0 40px rgba(0, 98, 65, 0.4)",
                  "0 0 20px rgba(0, 98, 65, 0.2)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-[#006241] to-[#00A86B] rounded-3xl blur-md opacity-30"
            />
            <div className="relative bg-white p-6 rounded-3xl shadow-2xl border-4 border-[#FFD700]">
              <Image
                src="/logo-enerSave.png"
                alt="EnerSave - FECAP"
                width={180}
                height={180}
                className="object-contain"
                priority
              />
            </div>
            {/* Decorative sparkles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-[#FFD700]" fill="#FFD700" />
            </motion.div>
          </div>

          {/* Brand Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#006241] to-[#00A86B] rounded-full shadow-lg"
          >
            <Zap className="w-5 h-5 text-[#FFD700]" fill="#FFD700" />
            <span className="text-white text-sm font-bold tracking-wider">FECAP • ENERSAVE</span>
            <Zap className="w-5 h-5 text-[#FFD700]" fill="#FFD700" />
          </motion.div>
          </motion.div>

        {/* Main Heading */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            <span className="text-[#006241]">Bem-vindo ao</span>
            <br />
            <span className="bg-gradient-to-r from-[#006241] via-[#00A86B] to-[#006241] bg-clip-text text-transparent animate-gradient-x">
              Sistema Inteligente
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-slate-700 font-medium max-w-2xl mx-auto"
          >
            Gestão sustentável e eficiente de salas
          </motion.p>
        </motion.div>

        {/* CTA Buttons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-5 justify-center pt-6"
        >
          {/* Primary CTA - New Registration */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onNewRegistration}
            size="lg"
              className="group relative px-12 py-8 text-xl font-bold rounded-2xl bg-gradient-to-r from-[#006241] to-[#00A86B] hover:from-[#004d33] hover:to-[#008659] text-white shadow-2xl hover:shadow-[#006241]/50 transition-all duration-300 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <UserPlus className="w-6 h-6 mr-3 inline" />
              Novo Cadastro
          </Button>
          </motion.div>

          {/* Secondary CTA - Room Access */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onAlreadyRegistered}
            size="lg"
              className="px-12 py-8 text-xl font-bold rounded-2xl bg-white hover:bg-[#fffbf0] text-[#006241] border-4 border-[#FFD700] shadow-2xl hover:shadow-[#FFD700]/50 transition-all duration-300"
          >
              <DoorOpen className="w-6 h-6 mr-3 inline" />
              Acesso a Salas
          </Button>
          </motion.div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-wrap justify-center gap-3 pt-4"
        >
          {[
            "🔒 100% Seguro",
            "⚡ Acesso Rápido", 
            "🌱 Sustentável",
            "🎓 FECAP Conectada"
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-[#006241] shadow-md border border-[#00A86B]/20"
            >
              {feature}
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="pt-8 border-t border-[#006241]/10"
        >
          <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            Sistema de registro e controle de acesso para <span className="font-semibold text-[#006241]">alunos, professores, técnicos e visitantes</span>
            <br />
            <span className="text-xs text-slate-500 mt-2 inline-block">
              Desenvolvido com tecnologia IoT e sustentabilidade
            </span>
          </p>
        </motion.div>
      </motion.div>

      {/* Animated grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#006241 1px, transparent 1px),
                           linear-gradient(90deg, #006241 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
    </div>
  )
}
