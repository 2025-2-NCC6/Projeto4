"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Zap, Shield, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simulated authentication
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      if (email && password) {
        router.push("/admin-faculdade/dashboard")
      } else {
        setError("Por favor, preencha todos os campos")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#006241] via-[#004d33] to-[#003826] p-4 relative overflow-hidden">
      {/* Background decoration with FECAP colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFD700]/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00A86B]/10 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFD700]/5 rounded-full blur-3xl"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-2 border-[#FFD700]/20 bg-white/95 backdrop-blur-xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-[#006241] via-[#FFD700] to-[#006241]"></div>
        
        <CardHeader className="space-y-4 text-center pb-6 pt-8">
          {/* FECAP Logo styled */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#006241] to-[#00A86B] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Zap className="w-10 h-10 text-[#FFD700] relative z-10 group-hover:animate-pulse" />
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#006241] to-[#00A86B] bg-clip-text text-transparent">
              EnerSave Portal
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2 font-medium">Sistema de Automação •</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-xs text-[#006241]">
                <Shield className="w-3 h-3" />
                <span>Seguro</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-xs text-[#006241]">
                <Zap className="w-3 h-3" />
                <span>Eficiente</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-xs text-[#006241]">
                <Lock className="w-3 h-3" />
                <span>Confiável</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">!</span>
                </div>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span>E-mail ou Matrícula</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@fecap.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-12 bg-slate-50 border-2 border-slate-200 focus:border-[#FFD700] focus:ring-[#FFD700] rounded-xl transition-all duration-300 hover:border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span>Senha</span>
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-12 bg-slate-50 border-2 border-slate-200 focus:border-[#FFD700] focus:ring-[#FFD700] rounded-xl pr-12 transition-all duration-300 hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#006241] transition-colors duration-200 hover:scale-110"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loading}
                  className="border-2 border-slate-300 data-[state=checked]:bg-[#006241] data-[state=checked]:border-[#006241]"
                />
                <Label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer hover:text-[#006241] transition-colors">
                  Lembrar-me
                </Label>
              </div>
              <Button 
                type="button" 
                variant="link" 
                className="text-sm text-[#006241] hover:text-[#00A86B] font-semibold p-0 h-auto"
              >
                Esqueci minha senha
              </Button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#006241] to-[#00A86B] hover:from-[#004d33] hover:to-[#008f5d] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
                  <span className="relative z-10">Entrando...</span>
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5 relative z-10" />
                  <span className="relative z-10">Entrar no Sistema</span>
                </>
              )}
            </Button>

            {/* Info adicional */}
            <div className="pt-4 border-t-2 border-slate-100">
              <p className="text-xs text-center text-slate-500">
                Ao entrar, você concorda com nossos{" "}
                <button type="button" className="text-[#006241] hover:underline font-semibold">
                  Termos de Uso
                </button>
              </p>
            </div>
          </form>
        </CardContent>
        
        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-[#006241] via-[#FFD700] to-[#006241]"></div>
      </Card>

      {/* Footer info */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-white/60">
          © 2025 FECAP - Fundação Escola de Comércio Álvares Penteado
        </p>
      </div>
    </div>
  )
}
