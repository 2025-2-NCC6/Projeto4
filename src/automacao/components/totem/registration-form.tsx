"use client"

import React, { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { ChevronLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RegistrationFormProps {
  onSubmit: (data: { name: string; email: string; type: string }) => void
  onBack: () => void
  isLoading?: boolean
}

export function RegistrationForm({ onSubmit, onBack, isLoading = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [emailFormatValid, setEmailFormatValid] = useState<boolean | null>(null)
  const { toast } = useToast()

  const userTypes = [
    { value: "aluno", label: "Aluno" },
    { value: "professor", label: "Professor" },
    { value: "tecnico", label: "Técnico/Funcionário" },
    { value: "visitante", label: "Visitante" },
  ]

  // Validação silenciosa de formato (apenas visual, sem mensagens)
  const validateEmailFormat = useCallback((email: string) => {
    if (!email || email.trim() === "") {
      setEmailFormatValid(null)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setEmailFormatValid(emailRegex.test(email))
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Nome
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres"
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.name)) {
      newErrors.name = "Nome contém caracteres inválidos"
    }

    // Email - valida formato
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email é obrigatório"
    } else if (emailFormatValid === false) {
      newErrors.email = "Email inválido"
    }

    // Tipo
    if (!formData.type) {
      newErrors.type = "Selecione um tipo de usuário"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast({
        variant: "destructive",
        title: "Erro no formulário",
        description: "Por favor, corrija os campos destacados.",
      })
      return false
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-[#f0f7f4] via-white to-[#fffbf0] relative overflow-hidden">
      {/* Background accents - FECAP colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006241] rounded-full blur-3xl opacity-15" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full blur-3xl opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-3 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cadastro de Usuário</h1>
            <p className="text-slate-600 text-sm mt-1">Preencha os dados abaixo</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-slate-900">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Digite seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`text-lg px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                errors.name ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-[#006241] focus:ring-2 focus:ring-[#006241]/20"
              }`}
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm font-medium"
              >
                {errors.name}
              </motion.p>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-slate-900">
              E-mail <span className="text-red-500">*</span>
              <span className="text-xs text-slate-500 font-normal ml-2">
                (necessário para acesso ao portal)
              </span>
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="seu.email@campus.edu.br"
                value={formData.email}
                onChange={(e) => {
                  const email = e.target.value
                  setFormData({ ...formData, email })
                  validateEmailFormat(email)
                }}
                disabled={isLoading}
                className={`text-lg px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 ${
                  errors.email
                    ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-[#006241] focus:ring-2 focus:ring-[#006241]/20"
                }`}
              />
              
              {/* Ícone sutil de validação de formato */}
              {formData.email && formData.email.length > 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailFormatValid === true && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                  {emailFormatValid === false && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <XCircle className="w-5 h-5 text-red-400" />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            
            {/* Mensagem de erro apenas quando necessário */}
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm font-medium"
              >
                {errors.email}
              </motion.p>
            )}
          </motion.div>

          {/* User Type Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <label className="block text-sm font-semibold text-slate-900">
              Tipo de Usuário <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {userTypes.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`py-4 px-3 rounded-xl font-medium transition-all border-2 text-center ${
                    formData.type === type.value
                      ? "bg-gradient-to-r from-[#006241] to-[#00A86B] text-white border-[#006241] shadow-lg ring-2 ring-[#FFD700]/50"
                      : "bg-white text-slate-900 border-slate-200 hover:border-[#006241]/30 hover:bg-[#f0f7f4]"
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
            {errors.type && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm font-medium"
              >
                {errors.type}
              </motion.p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4"
          >
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full py-6 text-lg font-semibold rounded-lg bg-gradient-to-r from-[#006241] to-[#00A86B] hover:from-[#004d33] hover:to-[#008659] text-white shadow-lg hover:shadow-xl hover:shadow-[#006241]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </span>
              ) : (
                "Continuar"
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}
