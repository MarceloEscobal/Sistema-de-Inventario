"use client"

import { motion } from "framer-motion"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw, 
  User, 
  Calendar,
  Clock,
  Search,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTransactions, useProfile } from "@/hooks/useInventory"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuditPage() {
  const router = useRouter()
  const { data: transactions, isLoading } = useTransactions()
  const { profile, isAdmin, isLoading: loadingProfile } = useProfile()

  useEffect(() => {
    if (!loadingProfile && profile && !isAdmin) {
      router.push('/inventory')
    }
  }, [profile, isAdmin, loadingProfile, router])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Historial de Auditoría</h1>
        <p className="page-subtitle">Datos históricos sincronizados con Supabase.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Buscar en el historial..."
          className="input-base pl-9" style={{ background: 'rgba(255,255,255,0.03)' }} />
      </div>

      <div className="space-y-4">
        {transactions?.map((tx: any, index: number) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/50 p-5 transition-all hover:bg-slate-800/40"
          >
            <div className="absolute left-0 top-0 h-full w-0.5" style={{ background: 'var(--gradient-primary)', opacity: 0.6 }} />
            
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  tx.tipo === "ENTRADA" ? "bg-emerald-500/10 text-emerald-400" :
                  tx.tipo === "SALIDA" ? "bg-rose-500/10 text-rose-400" :
                  "bg-amber-500/10 text-amber-400"
                )}>
                  {tx.tipo === "ENTRADA" ? <ArrowUpRight size={24} /> :
                   tx.tipo === "SALIDA" ? <ArrowDownRight size={24} /> :
                   <RefreshCcw size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{tx.producto_nombre || 'Producto Eliminado'}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--accent-secondary)', background: 'var(--accent-subtle)', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>{tx.producto_sku || 'N/A'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {new Date(tx.created_at).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <User size={14} /> {tx.usuario_email || 'Sistema'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className={cn(
                  "text-xl font-bold font-mono tracking-tight",
                  tx.tipo === "ENTRADA" ? "text-emerald-400" :
                  tx.tipo === "SALIDA" ? "text-rose-400" :
                  "text-amber-400"
                )}>
                  {tx.cantidad > 0 ? "+" : ""}{tx.cantidad}
                </div>
                <div className="text-right text-sm italic text-slate-500 max-w-[200px] truncate">
                  "{tx.motivo}"
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {(!transactions || transactions.length === 0) && (
          <div className="py-12 text-center text-slate-500">
            No se han registrado transacciones aún.
          </div>
        )}
      </div>
    </div>
  )
}
