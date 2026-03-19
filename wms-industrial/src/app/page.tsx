"use client"

import { motion } from "framer-motion"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { DollarSign, Package, AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import { useInventory, useTransactions, useEmpresa, useProfile } from "@/hooks/useInventory"
import { useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const { products, isLoading: loadingProducts } = useInventory()
  const { data: transactions, isLoading: loadingTX } = useTransactions()
  const { currencySymbol } = useEmpresa()
  const { profile, isAdmin, isLoading: loadingProfile } = useProfile()

  useEffect(() => {
    if (!loadingProfile && profile && !isAdmin) {
      router.push('/inventory')
    }
  }, [profile, isAdmin, loadingProfile, router])

  const { stats, chartData, topProductsData } = useMemo(() => {
    if (!products) return { stats: [], chartData: [], topProductsData: [] }
    
    // 1. Estadísticas Generales
    const totalValue = products.reduce((acc, p) => acc + (p.stock_actual * p.precio_venta), 0)
    const totalStock = products.reduce((acc, p) => acc + p.stock_actual, 0)
    const lowStockAlerts = products.filter(p => p.stock_actual <= p.stock_minimo).length
    const movementsCount = transactions?.length || 0

    const statsArray = [
      { 
        title: "Valor Total Inventario", 
        value: `${currencySymbol}${totalValue.toLocaleString()}`, 
        change: "Real", 
        trend: "up", 
        icon: currencySymbol === '$' ? DollarSign : Coins,
        color: "text-emerald-400"
      },
      { 
        title: "Modelos de Productos", 
        value: products.length.toString(), 
        change: `${totalStock.toLocaleString()} Unidades`, 
        trend: "up", 
        icon: Package,
        color: "text-blue-400"
      },
      { 
        title: "Alertas Activas", 
        value: lowStockAlerts.toString(), 
        change: lowStockAlerts > 0 ? "Crítico" : "Óptimo", 
        trend: lowStockAlerts > 0 ? "down" : "up", 
        icon: AlertCircle,
        color: lowStockAlerts > 0 ? "text-rose-400" : "text-emerald-400"
      },
      { 
        title: "Movimientos", 
        value: movementsCount.toString(), 
        change: "Historial", 
        trend: "up", 
        icon: TrendingUp,
        color: "text-purple-400"
      },
    ]

    // 2. Procesar Datos para Gráfico de Movimientos (Últimos 7 días) usando fecha local
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toLocaleDateString('en-CA') // Formato YYYY-MM-DD local
    }).reverse()

    const movementsByDay = last7Days.map(date => {
      const dayTX = transactions?.filter(tx => {
        const txDate = new Date(tx.created_at).toLocaleDateString('en-CA')
        return txDate === date
      }) || []
      
      const entradas = dayTX.filter(tx => tx.tipo === 'ENTRADA').reduce((acc, tx) => acc + tx.cantidad, 0)
      const salidas = dayTX.filter(tx => tx.tipo === 'SALIDA').reduce((acc, tx) => acc + tx.cantidad, 0)
      
      const [year, month, day] = date.split('-')
      return {
        name: `${day}/${month}`,
        entradas,
        salidas
      }
    })

    // 3. Top 5 Productos por Valor de Inventario
    const topProducts = [...products]
      .sort((a, b) => (b.stock_actual * b.precio_venta) - (a.stock_actual * a.precio_venta))
      .slice(0, 5)
      .map(p => ({
        name: p.nombre.length > 15 ? p.nombre.substring(0, 12) + '...' : p.nombre,
        valor: p.stock_actual * p.precio_venta
      }))

    return { stats: statsArray, chartData: movementsByDay, topProductsData: topProducts }
  }, [products, transactions])

  if (loadingProducts || loadingTX) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">Dashboard Ejecutivo</h1>
        <p className="page-subtitle">Analíticas de stock y flujos logísticos en tiempo real.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card stat-card p-5 glass-card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("rounded-xl p-2.5", stat.color)} style={{ background: 'rgba(255,255,255,0.06)' }}>
                <stat.icon size={18} />
              </div>
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-600 px-2 py-0.5 rounded-full",
                stat.trend === "up" ? "" : ""
              )} style={{
                fontWeight: 600,
                color: stat.trend === 'up' ? 'var(--status-success)' : 'var(--status-danger)',
                background: stat.trend === 'up' ? 'rgba(16,217,142,0.1)' : 'rgba(244,63,112,0.1)'
              }}>
                {stat.change}
                {stat.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-600 uppercase tracking-wider" style={{ fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{stat.title}</p>
              <p className="text-2xl font-800 tracking-tight" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-700 text-base" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Flujo de Inventario (7d)</h3>
            <div className="flex items-center gap-4 text-xs font-600" style={{ fontWeight: 600 }}>
              <div className="flex items-center gap-1.5" style={{ color: 'var(--accent-secondary)' }}>
                <div className="h-2 w-2 rounded-full" style={{ background: 'var(--accent-primary)' }} /> Entradas
              </div>
              <div className="flex items-center gap-1.5" style={{ color: 'var(--status-danger)' }}>
                <div className="h-2 w-2 rounded-full" style={{ background: 'var(--status-danger)' }} /> Salidas
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#54516b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#54516b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(108,99,255,0.05)' }}
                />
                <Bar dataKey="entradas" fill="#6c63ff" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="salidas" fill="#f43f70" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6"
        >
          <h3 className="font-700 text-base mb-6" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Top 5 Productos (Por Valor)</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" stroke="#54516b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${currencySymbol}${v}`} />
                <YAxis type="category" dataKey="name" stroke="#9b98c0" fontSize={11} tickLine={false} axisLine={false} width={90} />
                <Tooltip 
                  cursor={{ fill: 'rgba(108,99,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(value: any) => [`${currencySymbol}${Number(value || 0).toLocaleString()}`, "Valor"]}
                />
                <Bar dataKey="valor" fill="#10d98e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
