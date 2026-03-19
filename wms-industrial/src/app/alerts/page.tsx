"use client"

import { motion } from "framer-motion"
import { 
  AlertTriangle, 
  Bell, 
  Settings, 
  ShoppingBag,
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useInventory } from "@/hooks/useInventory"

export default function AlertsPage() {
  const { products, isLoading } = useInventory()

  const alerts = products?.filter(p => p.stock_actual <= p.stock_minimo).map(p => ({
    id: p.id,
    type: p.stock_actual === 0 ? "CRITICAL" : "WARNING",
    message: `${p.nombre} está en niveles bajos (${p.stock_actual}/${p.stock_minimo})`,
    time: "Ahora",
    category: "Inventario",
    action: "Reaprovisionar"
  })) || []

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Centro de Alertas</h1>
          <p className="text-slate-400">Notificaciones generadas automáticamente por tu stock en Supabase.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative flex flex-col gap-4 overflow-hidden rounded-xl border p-6 transition-all hover:bg-slate-800/20 md:flex-row md:items-center md:justify-between",
              alert.type === "CRITICAL" ? "border-rose-500/20 bg-rose-500/5" : 
              alert.type === "WARNING" ? "border-amber-500/20 bg-amber-500/5" : 
              "border-slate-800 bg-slate-900/50"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                alert.type === "CRITICAL" ? "bg-rose-500/10 text-rose-500" : 
                alert.type === "WARNING" ? "bg-amber-500/10 text-amber-500" : 
                "bg-blue-500/10 text-blue-500"
              )}>
                {alert.type === "CRITICAL" ? <AlertTriangle size={24} /> : 
                 alert.type === "WARNING" ? <Bell size={24} /> : 
                 <ShoppingBag size={24} />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-widest",
                    alert.type === "CRITICAL" ? "text-rose-500" : 
                    alert.type === "WARNING" ? "text-amber-500" : 
                    "text-blue-500"
                  )}>
                    {alert.type}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={12} /> {alert.time}
                  </span>
                </div>
                <p className="font-medium text-slate-200">{alert.message}</p>
                <p className="text-xs text-slate-500 uppercase tracking-tighter">{alert.category}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {alerts.length === 0 && (
          <div className="py-20 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-2xl">
            No hay alertas activas. Todo el stock está dentro de los niveles normales.
          </div>
        )}
      </div>
    </div>
  )
}
