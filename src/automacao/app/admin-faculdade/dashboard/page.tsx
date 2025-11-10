"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Building2, Clock, Users, Zap, Wrench } from "lucide-react"

const occupancyData = [
  { name: "Seg", ocupação: 75 },
  { name: "Ter", ocupação: 82 },
  { name: "Qua", ocupação: 88 },
  { name: "Qui", ocupação: 80 },
  { name: "Sex", ocupação: 92 },
  { name: "Sab", ocupação: 45 },
  { name: "Dom", ocupação: 20 },
]

const buildingData = [
  { name: "Prédio A", salas: 24 },
  { name: "Prédio B", salas: 18 },
  { name: "Prédio C", salas: 16 },
]

const roomTypeData = [
  { name: "Salas de Aula", value: 35, color: "#006241" },
  { name: "Laboratórios", value: 18, color: "#00A86B" },
  { name: "Auditórios", value: 8, color: "#4A90E2" },
  { name: "Outros", value: 7, color: "#F3F4F6" },
]

const statCards = [
  { title: "Salas Ativas", value: "68", icon: Building2, color: "bg-primary/10", textColor: "text-primary" },
  {
    title: "Solicitações Pendentes",
    value: "12",
    icon: Clock,
    color: "bg-yellow-500/10",
    textColor: "text-yellow-600",
  },
  { title: "Professores Ativos", value: "45", icon: Users, color: "bg-blue-500/10", textColor: "text-blue-600" },
  { title: "Consumo Energético", value: "8.2kW", icon: Zap, color: "bg-orange-500/10", textColor: "text-orange-600" },
  { title: "Em Manutenção", value: "3", icon: Wrench, color: "bg-red-500/10", textColor: "text-red-600" },
]

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard" systemStatus="online">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart - Occupancy */}
          <Card className="lg:col-span-2 border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Ocupação por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    labelStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ocupação"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Room Types */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Tipos de Salas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart - Buildings */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Ocupação por Prédio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buildingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                <Bar dataKey="salas" fill="var(--color-secondary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
