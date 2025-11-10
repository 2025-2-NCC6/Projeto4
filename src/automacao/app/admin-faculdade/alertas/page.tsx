"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Building2,
  AlertTriangle,
  Activity,
  Lightbulb,
  Wind,
  Projector,
  Monitor,
  ThermometerSun,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type ConsumoSala = {
  sala_nome: string
  predio: string
  consumo_kwh: number
  potencia_media_w: number
  custo_estimado: number
  leituras: number
}

type AlertaEnergia = {
  tipo: "alto_consumo" | "temperatura_alta" | "equipamento_ineficiente" | "custo_elevado"
  severidade: "alta" | "media" | "baixa"
  titulo: string
  mensagem: string
  sala?: string
  valor?: number
}

type Analytics = {
  total_leituras: number
  consumo_total_kwh: number
  potencia_media_w: number
  custo_total: number
  consumo_por_sala: ConsumoSala[]
  consumo_por_tipo: any[]
  consumo_por_hora: any[]
  temperatura_por_sala: any[]
  consumo_por_bloco: any[]
  analise_eficiencia: any
  tendencia_consumo: any
}

export default function DashboardEnergiaPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [leituraAtual, setLeituraAtual] = useState<any>(null)
  const [periodo, setPeriodo] = useState<"24h" | "7d" | "30d">("30d")
  const [isLoading, setIsLoading] = useState(true)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setUltimaAtualizacao(new Date())
    
    fetchAnalytics()
    fetchLeituraAtual()
    
    // Atualizar dados a cada 5 segundos
    const intervalLeitura = setInterval(fetchLeituraAtual, 5000)
    const intervalAnalytics = setInterval(fetchAnalytics, 30000) // Analytics a cada 30s
    
    return () => {
      clearInterval(intervalLeitura)
      clearInterval(intervalAnalytics)
    }
  }, [periodo])

  const fetchAnalytics = async () => {
    const isFirstLoad = analytics === null
    if (isFirstLoad) {
    setIsLoading(true)
    } else {
      setIsUpdating(true)
    }
    
    try {
      const response = await fetch(`/api/dashboard/analytics?periodo=${periodo}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const result = await response.json()
      
      if (result.success) {
        setAnalytics(result.data)
        setUltimaAtualizacao(new Date())
        console.log('📊 Analytics atualizado:', {
          total_leituras: result.data.total_leituras,
          consumo_total: result.data.consumo_total_kwh,
          salas_monitoradas: result.data.consumo_por_sala?.length || 0,
          periodo: periodo,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        })
      }
    } catch (error) {
      console.error("Erro ao carregar analytics:", error)
    } finally {
      setIsLoading(false)
      setIsUpdating(false)
    }
  }

  const fetchLeituraAtual = async () => {
    try {
      const response = await fetch(`/api/sensores/leitura?limit=1`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const result = await response.json()
      
      if (result.success && result.data?.length > 0) {
        const ultimaLeitura = result.data[0]
        console.log('📊 Leitura Atual Carregada:', {
          id: ultimaLeitura.id,
          timestamp: ultimaLeitura.timestamp,
          equipamento: ultimaLeitura.equipamento?.nome,
          sala: ultimaLeitura.equipamento?.sala?.nome,
          tensao: ultimaLeitura.dados_json?.tensao_v,
          corrente: ultimaLeitura.dados_json?.corrente_a,
          potencia: ultimaLeitura.dados_json?.potencia_w,
          energia: ultimaLeitura.dados_json?.energia_kwh,
          temperatura: ultimaLeitura.dados_json?.temperatura_c,
        })
        setLeituraAtual(ultimaLeitura)
      }
    } catch (error) {
      console.error("Erro ao carregar leitura atual:", error)
    }
  }

  // Gerar alertas baseados nos analytics
  const gerarAlertas = (): AlertaEnergia[] => {
    if (!analytics) return []
    
    const alertas: AlertaEnergia[] = []

    // Alertas de consumo por sala (contexto educacional)
    analytics.consumo_por_sala.slice(0, 3).forEach(sala => {
      // Consumo normal em sala de aula: 15-25 kWh/dia
      // Alto: > 35 kWh/dia | Muito alto: > 50 kWh/dia
      if (sala.consumo_kwh > 50) {
        alertas.push({
          tipo: "alto_consumo",
          severidade: "alta",
          titulo: `Consumo elevado em ${sala.sala_nome}`,
          mensagem: `${sala.consumo_kwh.toFixed(2)} kWh no período. Acima do esperado para ambiente educacional.`,
          sala: sala.sala_nome,
          valor: sala.consumo_kwh,
        })
      } else if (sala.consumo_kwh > 35) {
        alertas.push({
          tipo: "alto_consumo",
          severidade: "media",
          titulo: `Consumo acima da média em ${sala.sala_nome}`,
          mensagem: `${sala.consumo_kwh.toFixed(2)} kWh no período. Considere verificar equipamentos.`,
          sala: sala.sala_nome,
          valor: sala.consumo_kwh,
        })
      }

      // Potência normal para sala de aula: 1500-2500W (com ar ligado)
      // Alerta se > 3500W (pode indicar múltiplos equipamentos desnecessários)
      if (sala.potencia_media_w > 3500) {
        alertas.push({
          tipo: "equipamento_ineficiente",
          severidade: "alta",
          titulo: `Potência muito elevada em ${sala.sala_nome}`,
          mensagem: `${sala.potencia_media_w.toFixed(0)}W em média. Verifique se há equipamentos desnecessários ligados.`,
          sala: sala.sala_nome,
          valor: sala.potencia_media_w,
        })
      } else if (sala.potencia_media_w > 2500) {
        alertas.push({
          tipo: "equipamento_ineficiente",
          severidade: "media",
          titulo: `Potência elevada em ${sala.sala_nome}`,
          mensagem: `${sala.potencia_media_w.toFixed(0)}W em média. Dentro do esperado, mas pode otimizar.`,
          sala: sala.sala_nome,
          valor: sala.potencia_media_w,
        })
      }
    })

    // Alertas de temperatura
    analytics.temperatura_por_sala.forEach((sala: any) => {
      if (sala.temp_media_c > 28) {
        alertas.push({
          tipo: "temperatura_alta",
          severidade: "alta",
          titulo: `Temperatura elevada em ${sala.sala_nome}`,
          mensagem: `Temperatura média de ${sala.temp_media_c.toFixed(1)}°C. Ar condicionado pode estar desligado.`,
          sala: sala.sala_nome,
          valor: sala.temp_media_c,
        })
      }
    })

    // Alerta de fator de potência ruim
    if (analytics.analise_eficiencia.fator_potencia_medio < 0.90) {
      alertas.push({
        tipo: "equipamento_ineficiente",
        severidade: "media",
        titulo: "Fator de potência abaixo do ideal",
        mensagem: `Fator de potência médio de ${analytics.analise_eficiencia.fator_potencia_medio.toFixed(2)}. Ideal: >0.92.`,
        valor: analytics.analise_eficiencia.fator_potencia_medio,
      })
    }

    return alertas.slice(0, 6)
  }

  const alertas = gerarAlertas()
  const topSalas = analytics?.consumo_por_sala.slice(0, 5) || []

  const getAlertIcon = (tipo: string) => {
    const icons = {
      alto_consumo: Zap,
      temperatura_alta: ThermometerSun,
      equipamento_ineficiente: Activity,
      custo_elevado: DollarSign,
    }
    return icons[tipo as keyof typeof icons] || AlertTriangle
  }

  const getAlertColor = (severidade: string) => {
    const colors = {
      alta: "bg-red-100 border-red-300 text-red-900",
      media: "bg-yellow-100 border-yellow-300 text-yellow-900",
      baixa: "bg-blue-100 border-blue-300 text-blue-900",
    }
    return colors[severidade as keyof typeof colors]
  }

  const getTrendIcon = (value: number) => {
    if (value > 5) return <ArrowUpRight className="w-4 h-4 text-red-600" />
    if (value < -5) return <ArrowDownRight className="w-4 h-4 text-green-600" />
    return <Minus className="w-4 h-4 text-slate-400" />
  }

  const getEquipIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      luz: Lightbulb,
      ar_condicionado: Wind,
      projetor: Projector,
      computador: Monitor,
    }
    return icons[tipo] || Activity
  }

  // Função auxiliar para criar gauge visual
  const createGauge = (value: number, max: number, label: string, unit: string, color: string) => {
    const percentage = Math.min((value / max) * 100, 100)
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e2e8f0"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={color}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${percentage * 3.51} 351`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{value.toFixed(1)}</span>
            <span className="text-xs text-slate-600">{unit}</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-700 mt-2">{label}</p>
      </div>
    )
  }

  return (
    <AdminLayout title="Dashboard de Energia">
      <div className="space-y-6 max-w-full">
        {/* Header com Status */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#006241] to-[#00A86B] bg-clip-text text-transparent">
              Dashboard de Energia • EnerSave
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-700">
                  AO VIVO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  Leitura: {leituraAtual ? new Date(leituraAtual.timestamp).toLocaleTimeString('pt-BR') : 'Aguardando...'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isUpdating && (
                  <div className="animate-spin w-3 h-3 border-2 border-[#006241] border-t-transparent rounded-full" />
                )}
                <span className="text-sm text-slate-500" suppressHydrationWarning>
                  • Analytics: {isMounted && ultimaAtualizacao ? ultimaAtualizacao.toLocaleTimeString('pt-BR') : '--:--:--'}
                </span>
              </div>
              {analytics?.tendencia_consumo && (
                <Badge className={analytics.tendencia_consumo.variacao_percentual < 0 ? "bg-green-500" : "bg-red-500"}>
                  {getTrendIcon(analytics.tendencia_consumo.variacao_percentual)}
                  {analytics.tendencia_consumo.variacao_percentual.toFixed(1)}% vs período anterior
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
              <SelectTrigger className="w-48 border-[#006241] focus:ring-[#006241] hover:bg-[#f0f7f4] transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">📅 Últimas 24 horas</SelectItem>
              <SelectItem value="7d">📅 Últimos 7 dias</SelectItem>
              <SelectItem value="30d">📅 Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
            <button
              onClick={() => {
                fetchAnalytics()
                fetchLeituraAtual()
              }}
              disabled={isUpdating}
              className="px-4 py-2 bg-[#006241] hover:bg-[#004d33] text-white rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Activity className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Métricas Principais - FECAP Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Consumo Total */}
          <Card className="p-6 bg-gradient-to-br from-[#f0f7f4] to-white border-2 border-[#006241]/20 hover:border-[#006241] hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Consumo Total
                </p>
                <h3 className="text-3xl font-bold text-[#006241] mt-2">
                  {analytics?.consumo_total_kwh.toFixed(2) || "0.00"}
                </h3>
                <p className="text-xs text-slate-600 mt-1">kWh no período</p>
                <div className="flex items-center gap-1 mt-2 text-xs">
                  {analytics?.tendencia_consumo && getTrendIcon(analytics.tendencia_consumo.variacao_percentual)}
                  <span className={analytics?.tendencia_consumo?.variacao_percentual < 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {analytics?.tendencia_consumo?.variacao_percentual.toFixed(1) || "0"}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#006241] to-[#00A86B] rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-[#FFD700]" />
              </div>
            </div>
          </Card>

          {/* Custo Estimado */}
          <Card className="p-6 bg-gradient-to-br from-[#fffbf0] to-white border-2 border-[#FFD700]/30 hover:border-[#FFD700] hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Custo Estimado
                </p>
                <h3 className="text-3xl font-bold text-[#006241] mt-2">
                  R$ {analytics?.custo_total.toFixed(2) || "0.00"}
                </h3>
                <p className="text-xs text-slate-600 mt-1">Tarifa: R$ 0,64/kWh</p>
                <p className="text-xs text-[#00A86B] font-semibold mt-2">
                  💰 Economia em foco
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          {/* Potência & Eficiência */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Potência & Eficiência
                </p>
                <h3 className="text-3xl font-bold text-purple-900 mt-2">
                  {analytics?.potencia_media_w.toFixed(0) || "0"}
                </h3>
                <p className="text-xs text-slate-600 mt-1">Watts médio</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`text-xs ${
                    (analytics?.analise_eficiencia?.fator_potencia_medio || 0) >= 0.92 ? 'bg-green-500' : 
                    (analytics?.analise_eficiencia?.fator_potencia_medio || 0) >= 0.85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    FP: {analytics?.analise_eficiencia?.fator_potencia_medio.toFixed(2) || "N/A"}
                          </Badge>
              </div>
                      </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          {/* Leituras & Status */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 group">
            <div className="flex items-start justify-between">
              <div className="w-full">
                <p className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 group-hover:animate-bounce" />
                  Monitoramento Ativo
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-white rounded-lg hover:bg-orange-50 transition-all">
                    <h3 className="text-2xl font-bold text-orange-900">
                  {analytics?.total_leituras || 0}
                </h3>
                    <p className="text-xs text-slate-600">Leituras totais</p>
              </div>
                  <div className="p-2 bg-white rounded-lg hover:bg-blue-50 transition-all">
                    <h3 className="text-2xl font-bold text-blue-600">
                      {analytics?.consumo_por_sala?.length || 0}
                    </h3>
                    <p className="text-xs text-slate-600">Salas monitoradas</p>
              </div>
                  <div className="p-2 bg-white rounded-lg hover:bg-purple-50 transition-all">
                    <h3 className="text-2xl font-bold text-purple-600">
                      {analytics?.consumo_por_tipo?.reduce((sum: number, t: any) => sum + (t.equipamentos_count || 0), 0) || 0}
            </h3>
                    <p className="text-xs text-slate-600">Equipamentos únicos</p>
            </div>
                  <div className="p-2 bg-white rounded-lg hover:bg-green-50 transition-all">
                    <h3 className="text-2xl font-bold text-green-600">
                      {analytics?.consumo_por_bloco?.filter((b: any) => b.leituras > 0).length || 0}
            </h3>
                    <p className="text-xs text-slate-600">Blocos ativos</p>
        </div>
                      </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-semibold">Sistema MIO conectado</span>
                        </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Período: {periodo}
                  </span>
                  </div>
                      </div>
                    </div>
                  </Card>
            </div>

        {/* Painel de Tempo Real - DESTAQUE */}
        {leituraAtual && (
          <Card className="p-6 bg-gradient-to-br from-[#f0f7f4] via-white to-[#fffbf0] border-2 border-[#FFD700] shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#006241] to-[#00A86B] bg-clip-text text-transparent flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#FFD700] animate-pulse" />
                Status em Tempo Real
          </h2>
              <div className="flex flex-col items-end gap-1">
                <Badge className="bg-green-500 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                  AO VIVO
                </Badge>
                <span className="text-xs text-slate-600 font-mono">
                  {new Date(leituraAtual.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                  <span className="text-xs text-slate-500">
                    ID: {leituraAtual.id}
                  </span>
                    </div>
                  </div>
                  
                  {/* Gauges Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    {createGauge(
                      leituraAtual.dados_json?.tensao_v || 0, 
                      250, 
                      "🔌 Tensão", 
                      "V",
                "#006241"
                    )}
                    {createGauge(
                      leituraAtual.dados_json?.corrente_a || 0, 
                      10, 
                      "⚡ Corrente", 
                      "A",
                      "#8b5cf6"
                    )}
                    {createGauge(
                      leituraAtual.dados_json?.potencia_w || 0, 
                      3000, 
                      "💡 Potência", 
                      "W",
                "#FFD700"
                    )}
                    {createGauge(
                      leituraAtual.dados_json?.energia_kwh || 0, 
                      100, 
                      "🔋 Energia", 
                      "kWh",
                "#00A86B"
                    )}
                    </div>
                    
            {/* Análises em Tempo Real */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Info do Equipamento Atual */}
              <Card className="p-4 bg-white border-[#006241]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#006241] to-[#00A86B] rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                    </div>
                  <div>
                    <p className="text-xs text-slate-600">Equipamento Ativo</p>
                    <p className="font-bold text-slate-900 text-sm">{leituraAtual.equipamento?.nome || 'N/A'}</p>
                    </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Local:</span>
                    <span className="font-semibold text-slate-900">{leituraAtual.equipamento?.sala?.nome || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Prédio:</span>
                    <Badge variant="outline" className="text-xs">{leituraAtual.equipamento?.sala?.predio || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tipo:</span>
                    <span className="font-semibold text-[#006241] capitalize">{leituraAtual.equipamento?.tipo || 'N/A'}</span>
                  </div>
                </div>
              </Card>

              {/* Comparativo por Bloco */}
              <Card className="p-4 bg-gradient-to-br from-[#f0f7f4] to-white border-[#00A86B]/30 lg:col-span-2">
                <h4 className="font-bold text-[#006241] mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Média de Consumo por Bloco
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {(analytics?.consumo_por_bloco || []).map((bloco: any) => {
                    const maxConsumoBloco = Math.max(...(analytics?.consumo_por_bloco || []).map((b: any) => b.consumo_kwh), 1)
                    const percentageBloco = (bloco.consumo_kwh / maxConsumoBloco) * 100
                    const mediaPorSala = bloco.leituras > 0 ? (bloco.consumo_kwh / bloco.leituras) : 0
                    
                    return (
                      <div key={bloco.bloco} className="bg-white rounded-lg p-3 border-2 border-slate-200 hover:border-[#FFD700] hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#006241] to-[#00A86B] rounded-lg flex items-center justify-center font-bold text-white text-sm group-hover:scale-110 transition-transform">
                              {bloco.bloco}
          </div>
                            <span className="text-xs font-semibold text-slate-700">Bloco {bloco.bloco}</span>
        </div>
                  </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600">Total:</span>
                            <span className="text-sm font-bold text-[#006241]">{bloco.consumo_kwh.toFixed(1)} kWh</span>
                  </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600">Custo:</span>
                            <span className="text-sm font-bold text-[#FFD700]">R$ {bloco.custo_estimado.toFixed(2)}</span>
                </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600">Média/leitura:</span>
                            <span className="text-xs font-semibold text-blue-600">{mediaPorSala.toFixed(2)} kWh</span>
                  </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-gradient-to-r from-[#006241] to-[#00A86B] h-1.5 rounded-full transition-all"
                              style={{ width: `${percentageBloco}%` }}
                          />
                  </div>
                          <p className="text-xs text-center text-slate-500 mt-1">{bloco.leituras} leituras</p>
                </div>
                </div>
                    )
                  })}
                </div>
              </Card>
              </div>

            {/* Métricas Rápidas - Linha 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200 hover:border-green-400 hover:shadow-md transition-all">
                <p className="text-xs text-slate-600 mb-1">🎚 Fator de Potência</p>
                <p className={`text-xl font-bold ${
                  (leituraAtual.dados_json?.fator_potencia || 0) >= 0.92 ? 'text-green-600' : 
                  (leituraAtual.dados_json?.fator_potencia || 0) >= 0.85 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {leituraAtual.dados_json?.fator_potencia?.toFixed(2) || 'N/A'}
                        </p>
                  </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all">
                <p className="text-xs text-slate-600 mb-1">🔁 Frequência</p>
                <p className="text-xl font-bold text-blue-600">
                  {leituraAtual.dados_json?.frequencia_hz?.toFixed(1) || '60.0'} Hz
                    </p>
                  </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all">
                <p className="text-xs text-slate-600 mb-1">⚡ Potência Ativa Agora</p>
                <p className="text-xl font-bold text-purple-600">
                  {(leituraAtual.dados_json?.potencia_w || 0).toFixed(0)} W
                </p>
                </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all">
                <p className="text-xs text-slate-600 mb-1">🔋 Energia Acumulada</p>
                <p className="text-xl font-bold text-emerald-600">
                  {(leituraAtual.dados_json?.energia_kwh || 0).toFixed(2)} kWh
                        </p>
                    </div>
        </div>

            {/* Termostatos em Tempo Real - Linha 2 */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <ThermometerSun className="w-4 h-4 text-orange-600" />
                  🌡️ Temperatura das Salas • Monitoramento em Tempo Real
                </h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-500">
                    Atualizado: {isMounted && ultimaAtualizacao ? ultimaAtualizacao.toLocaleTimeString('pt-BR') : '--:--:--'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {(() => {
                  // Se temos leitura atual da mesma sala, destacar com borda especial
                  const salaAtualId = leituraAtual?.equipamento?.sala?.id
                  const salaAtualNome = leituraAtual?.equipamento?.sala?.nome
                  const tempAtual = leituraAtual?.dados_json?.temperatura_c
                  
                  return (analytics?.temperatura_por_sala || []).slice(0, 6).map((sala: any, idx: number) => {
                    // Usar temperatura da leitura atual se for da mesma sala
                    const isLeituraAtual = salaAtualId === sala.sala_id
                    const temperatura = isLeituraAtual && tempAtual ? tempAtual : sala.temp_media_c
                    
                    const tempColor = 
                      temperatura > 28 ? 'border-red-400 bg-red-50 text-red-900' :
                      temperatura > 24 ? 'border-yellow-400 bg-yellow-50 text-yellow-900' : 
                      'border-green-400 bg-green-50 text-green-900'
                    
                    const borderStyle = isLeituraAtual ? 'border-4 shadow-lg ring-2 ring-green-300' : 'border-2'
                    
                    return (
                      <div key={idx} className={`rounded-lg p-2 ${borderStyle} ${tempColor} hover:shadow-md transition-all cursor-pointer relative`}>
                        {isLeituraAtual && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            AGORA
                        </div>
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold truncate flex-1" title={sala.sala_nome}>
                            {sala.sala_nome.length > 12 ? sala.sala_nome.substring(0, 12) + '...' : sala.sala_nome}
                          </p>
                          <ThermometerSun className="w-3 h-3 flex-shrink-0" />
                      </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">{temperatura.toFixed(1)}°C</span>
                          <span className="text-xs opacity-75">💧 {sala.umidade_media_pct.toFixed(0)}%</span>
                        </div>
                        <div className="mt-1 w-full bg-white/50 rounded-full h-1">
                          <div 
                            className="bg-current h-1 rounded-full transition-all"
                            style={{ width: `${Math.min((temperatura / 35) * 100, 100)}%` }}
                          />
                        </div>
                              </div>
                    )
                  })
                })()}
                {(analytics?.temperatura_por_sala || []).length === 0 && (
                  <div className="col-span-full text-center py-3 text-slate-500 text-xs bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <ThermometerSun className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    Aguardando dados de temperatura das salas...
                      </div>
                    )}
                  </div>
                          </div>
                        </Card>
                      )}

        {/* Alertas Críticos */}
        {alertas.length > 0 && (
          <Card className="p-5 border-2 border-red-200 bg-red-50/50">
            <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas Críticos ({alertas.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {alertas.slice(0, 6).map((alerta, idx) => {
                const Icon = getAlertIcon(alerta.tipo)
                return (
                  <div key={idx} className={`p-3 rounded-lg border ${getAlertColor(alerta.severidade)}`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{alerta.titulo}</p>
                        <p className="text-xs opacity-75 line-clamp-1">{alerta.mensagem}</p>
                              </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {alerta.severidade === "alta" ? "🔴" : "🟡"}
                      </Badge>
                              </div>
                            </div>
                )
              })}
                          </div>
                        </Card>
                      )}

        {/* Top 3 Salas + Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Top 3 Salas Mais Consumidoras */}
          <Card className="p-5 bg-gradient-to-br from-[#fffbf0] to-white border-2 border-[#FFD700]/30">
            <h3 className="font-bold text-[#006241] mb-4 flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4" />
              Top 3 Salas
            </h3>
            <div className="space-y-3">
              {topSalas.slice(0, 3).map((sala: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-3 border-2 border-slate-200 hover:border-[#006241] hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-[#FFD700] text-[#006241]' :
                      idx === 1 ? 'bg-slate-300 text-slate-700' :
                      'bg-amber-600 text-white'
                    }`}>
                      {idx + 1}
                              </div>
                    <p className="font-semibold text-slate-900 text-xs truncate flex-1">{sala.sala_nome}</p>
                                </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Consumo:</span>
                      <span className="font-bold text-[#006241]">{sala.consumo_kwh.toFixed(1)} kWh</span>
                              </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Custo:</span>
                      <span className="font-bold text-[#FFD700]">R$ {sala.custo_estimado.toFixed(2)}</span>
                            </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Potência:</span>
                      <span className="font-semibold text-purple-600">{sala.potencia_media_w.toFixed(0)}W</span>
                          </div>
                    </div>
                </div>
              ))}
              {topSalas.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">Sem dados</p>
              )}
                      </div>
                    </Card>

          {/* Gráfico de Consumo por Equipamento */}
          <Card className="p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#006241] flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Consumo por Tipo de Equipamento
              </h3>
              <Badge variant="outline" className="text-xs">
                {analytics?.consumo_por_tipo?.length || 0} tipos monitorados
              </Badge>
            </div>

            {(analytics?.consumo_por_tipo || []).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Barras */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-4">📊 Consumo em kWh</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.consumo_por_tipo || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="tipo" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => value.replace('_', ' ').substring(0, 10)}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #006241',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'consumo_kwh') return [`${value.toFixed(2)} kWh`, 'Consumo']
                          if (name === 'potencia_media_w') return [`${value.toFixed(0)} W`, 'Potência Média']
                          return value
                        }}
                        labelFormatter={(label) => label.replace('_', ' ').toUpperCase()}
                      />
                      <Bar dataKey="consumo_kwh" fill="#006241" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Pizza */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-4">🥧 Distribuição de Custo</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.consumo_por_tipo || []}
                        dataKey="custo_estimado"
                        nameKey="tipo"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ tipo, custo_estimado }) => `R$ ${custo_estimado.toFixed(2)}`}
                        labelLine={false}
                      >
                        {(analytics?.consumo_por_tipo || []).map((entry: any, index: number) => {
                          const colors = ['#006241', '#00A86B', '#FFD700', '#8b5cf6', '#f59e0b', '#3b82f6']
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #FFD700',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any, name: string, props: any) => [
                          `R$ ${value.toFixed(2)}`,
                          `${props.payload.tipo.replace('_', ' ')} (${props.payload.equipamentos_count} un.)`
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  </div>
              </div>
              ) : (
                <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Sem dados de equipamentos</p>
                </div>
              )}

            {/* Legenda dos Equipamentos */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {(analytics?.consumo_por_tipo || []).map((tipo: any, idx: number) => {
                  const Icon = getEquipIcon(tipo.tipo)
                  const colors = ['#006241', '#00A86B', '#FFD700', '#8b5cf6', '#f59e0b', '#3b82f6']
                  return (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-[#f0f7f4] transition-all">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      <Icon className="w-4 h-4 text-slate-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 capitalize truncate">
                          {tipo.tipo.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-slate-600">
                          {tipo.equipamentos_count} un. • {tipo.consumo_kwh.toFixed(1)} kWh
                        </p>
                        </div>
                      </div>
                  )
                })}
                    </div>
                </div>
              </Card>
        </div>

        {/* Histórico Compacto + Temperatura */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consumo por Horário - Gráfico */}
              <Card className="p-6">
            <h3 className="font-bold text-[#006241] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Consumo nas Últimas Horas
            </h3>
            {(analytics?.consumo_por_hora || []).filter((h: any) => h.consumo_kwh > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={(analytics?.consumo_por_hora || []).filter((h: any) => h.consumo_kwh > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="hora" 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #00A86B',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'consumo_kwh') return [`${value.toFixed(2)} kWh`, 'Consumo']
                      if (name === 'potencia_media_w') return [`${value.toFixed(0)} W`, 'Potência']
                      return value
                    }}
                    labelFormatter={(label) => `Hora: ${label}h`}
                  />
                  <Bar dataKey="consumo_kwh" fill="#00A86B" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="potencia_media_w" fill="#FFD700" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-slate-500">Sem dados históricos</p>
              </div>
            )}
          </Card>

          {/* Temperatura por Sala */}
              <Card className="p-6">
            <h3 className="font-bold text-[#006241] mb-4 flex items-center gap-2">
              <ThermometerSun className="w-5 h-5" />
              Clima nas Salas
            </h3>
            <div className="space-y-2">
              {(analytics?.temperatura_por_sala || []).slice(0, 8).map((sala: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 hover:bg-[#f0f7f4] rounded-lg transition-all cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700 truncate flex-1">{sala.sala_nome}</span>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs ${
                          sala.temp_media_c > 28 ? "bg-red-500" :
                          sala.temp_media_c > 24 ? "bg-yellow-500" : "bg-green-500"
                    }`}>
                          {sala.temp_media_c.toFixed(1)}°C
                        </Badge>
                    <span className="text-xs text-slate-600">💧 {sala.umidade_media_pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                  {(analytics?.temperatura_por_sala || []).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Sem leituras de temperatura</p>
                  )}
                  </div>
              </Card>
            </div>

        {/* Info Técnica do Período */}
        {analytics && (
          <Card className="p-4 bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-600">📊 Período selecionado:</span>
                  <span className="font-bold text-[#006241] ml-2">
                    {periodo === "24h" ? "Últimas 24 horas" : periodo === "7d" ? "Últimos 7 dias" : "Últimos 30 dias"}
                  </span>
                        </div>
                        <div>
                  <span className="text-slate-600">📋 Total de registros processados:</span>
                  <span className="font-bold text-orange-600 ml-2">{analytics.total_leituras}</span>
                        </div>
                <div>
                  <span className="text-slate-600">🏢 Salas com dados:</span>
                  <span className="font-bold text-blue-600 ml-2">{analytics.consumo_por_sala?.length || 0}</span>
                      </div>
                <div>
                  <span className="text-slate-600">⚡ Tipos de equip.:</span>
                  <span className="font-bold text-purple-600 ml-2">{analytics.consumo_por_tipo?.length || 0}</span>
                        </div>
                        </div>
              <div className="text-slate-500">
                Atualização automática ativa (30s)
                        </div>
                      </div>
                    </Card>
        )}

        {/* Resumo Final Interativo */}
        <Card className="p-6 bg-gradient-to-br from-[#f0f7f4] to-white border-2 border-[#006241]/20 hover:border-[#FFD700] transition-all hover:shadow-xl">
          <h3 className="font-bold text-[#006241] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumo de Impacto & Sustentabilidade
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all cursor-pointer border-2 border-transparent hover:border-green-300">
              <p className="text-sm text-slate-600 mb-2">💚 Economia Potencial</p>
              <p className="text-3xl font-bold text-[#00A86B]">
                {analytics ? (analytics.consumo_total_kwh * 0.3).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-slate-600 mt-1">kWh economizáveis</p>
              <p className="text-xs text-green-700 font-semibold mt-2">≈ 30% do total</p>
                      </div>
                      
            <div className="p-4 bg-[#fffbf0] rounded-xl hover:bg-yellow-100 transition-all cursor-pointer border-2 border-transparent hover:border-[#FFD700]">
              <p className="text-sm text-slate-600 mb-2">💰 Redução de Custo</p>
              <p className="text-3xl font-bold text-[#FFD700]">
                R$ {analytics ? (analytics.custo_total * 0.3).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-slate-600 mt-1">Economia possível</p>
              <p className="text-xs text-orange-700 font-semibold mt-2">Baseado em R$ 0,64/kWh</p>
                        </div>
                        
            <div className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer border-2 border-transparent hover:border-emerald-300">
              <p className="text-sm text-slate-600 mb-2">🌱 CO₂ Evitado</p>
              <p className="text-3xl font-bold text-green-600">
                {analytics ? (analytics.consumo_total_kwh * 0.4).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-slate-600 mt-1">kg de CO₂</p>
              <p className="text-xs text-green-700 font-semibold mt-2">Impacto ambiental</p>
                        </div>
                        
            <div className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all cursor-pointer border-2 border-transparent hover:border-purple-300">
              <p className="text-sm text-slate-600 mb-2">📊 Eficiência Geral</p>
              <p className="text-3xl font-bold text-[#006241]">
                {analytics ? ((analytics.analise_eficiencia?.fator_potencia_medio || 0) * 100).toFixed(0) : '0'}%
              </p>
              <p className="text-xs text-slate-600 mt-1">Fator de potência</p>
              <p className={`text-xs font-semibold mt-2 ${
                (analytics?.analise_eficiencia?.fator_potencia_medio || 0) >= 0.92 ? 'text-green-600' : 
                (analytics?.analise_eficiencia?.fator_potencia_medio || 0) >= 0.85 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(analytics?.analise_eficiencia?.fator_potencia_medio || 0) >= 0.92 ? '✓ Excelente' : 
                 (analytics?.analise_eficiencia?.fator_potencia_medio || 0) >= 0.85 ? '⚠ Aceitável' : '✗ Precisa melhorar'}
                          </p>
                      </div>
                    </div>
                  </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-12 text-center bg-gradient-to-br from-[#f0f7f4] to-white border-2 border-[#006241]/20">
            <div className="animate-spin w-10 h-10 border-4 border-[#006241] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#006241] font-semibold">Carregando dados de sensores EnerSave...</p>
            <p className="text-xs text-slate-500 mt-2">Aguarde enquanto coletamos as informações</p>
                  </Card>
                )}

        {/* Empty State */}
        {!isLoading && !leituraAtual && topSalas.length === 0 && (
          <Card className="p-12 text-center bg-gradient-to-br from-[#f0f7f4] to-white border-2 border-[#FFD700]">
            <Zap className="w-16 h-16 text-[#006241] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#006241] mb-2">Dashboard Aguardando Dados</h3>
            <p className="text-slate-600 mb-4">Execute leituras de teste para visualizar o dashboard completo</p>
            <code className="bg-slate-100 px-4 py-2 rounded-lg text-sm text-slate-700 inline-block">
              node mio-server/test-sensor.js energia
            </code>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
