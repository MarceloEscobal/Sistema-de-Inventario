"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowUpCircle, ArrowDownCircle, Loader2, Save } from "lucide-react"
import { cn } from "../lib/utils"

interface StockMovementModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
  onConfirm: (data: { tipo: 'ENTRADA' | 'SALIDA', cantidad: number, motivo: string }) => Promise<void>
}

export function StockMovementModal({ isOpen, onClose, product, onConfirm }: StockMovementModalProps) {
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA')
  const [cantidad, setCantidad] = useState<any>("1")
  const [motivo, setMotivo] = useState("")

  const parsedCantidad = parseInt(cantidad) || 0
  const isInvalidSalida = tipo === 'SALIDA' && parsedCantidad > (product?.stock_actual || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (parsedCantidad <= 0 || isInvalidSalida) return
    
    setLoading(true)
    try {
      await onConfirm({ tipo, cantidad: parsedCantidad, motivo })
      onClose()
      setCantidad("1")
      setMotivo("")
      setTipo('ENTRADA')
    } catch (error) {
      console.error("Error saving movement:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(10px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative', width: '100%', maxWidth: '420px', zIndex: 1,
              background: 'rgba(12,12,28,0.98)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', padding: '2rem'
            }}
          >
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Registrar Movimiento</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product?.nombre}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--accent-subtle)', color: 'var(--accent-secondary)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    Stock: {product?.stock_actual}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="btn-icon"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipo('ENTRADA')}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all",
                    tipo === 'ENTRADA' 
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" 
                      : "border-slate-800 bg-slate-950 text-slate-500 hover:bg-slate-800"
                  )}
                >
                  <ArrowUpCircle size={18} />
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('SALIDA')}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all",
                    tipo === 'SALIDA' 
                      ? "border-rose-500/50 bg-rose-500/10 text-rose-400" 
                      : "border-slate-800 bg-slate-950 text-slate-500 hover:bg-slate-800"
                  )}
                >
                  <ArrowDownCircle size={18} />
                  Salida
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    Cantidad <span className="text-rose-500">*</span>
                  </label>
                  {tipo === 'SALIDA' && (
                    <span className={cn(
                      "text-[10px] font-bold",
                      isInvalidSalida ? "text-rose-500" : "text-slate-500"
                    )}>
                      Máx. {product?.stock_actual}
                    </span>
                  )}
                </div>
                <input
                  required
                  type="number"
                  min="1"
                  max={tipo === 'SALIDA' ? product?.stock_actual : undefined}
                  className={cn(
                    "w-full rounded-lg border bg-slate-950 px-4 py-3 text-2xl font-mono font-bold transition-colors focus:outline-none focus:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    isInvalidSalida 
                      ? "border-rose-500 text-rose-500 focus:ring-rose-500" 
                      : "border-slate-800 text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                  )}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
                {isInvalidSalida && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-medium text-rose-500 bg-rose-500/10 p-2 rounded-lg"
                  >
                    ⚠️ No hay suficiente stock. (Disponible: {product?.stock_actual})
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  Motivo / Concepto <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder={tipo === 'ENTRADA' ? "Ej. Reposición de stock" : "Ej. Venta a cliente"}
                  className="input-base"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </div>

              <div style={{ paddingTop: '1rem', display: 'flex', gap: '0.65rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                <button
                  disabled={loading || cantidad <= 0 || !motivo || isInvalidSalida}
                  type="submit"
                  className="flex items-center justify-center gap-2"
                  style={{
                    flex: 1, padding: '0.65rem 1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                    color: '#fff', border: 'none', cursor: 'pointer', opacity: (loading || cantidad <= 0 || !motivo || isInvalidSalida) ? 0.5 : 1,
                    background: tipo === 'ENTRADA' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f43f70, #e11d48)',
                    boxShadow: tipo === 'ENTRADA' ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(244,63,112,0.3)'
                  }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Registrar {tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
