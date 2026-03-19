"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Save } from "lucide-react"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: any) => Promise<void>
  initialData?: any
}

export function AddProductModal({ isOpen, onClose, onSave, initialData }: AddProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({
    sku: "",
    nombre: "",
    descripcion: "",
    stock_actual: "0",
    stock_minimo: "10",
    precio_costo: "0",
    precio_venta: "0",
  })

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        sku: initialData.sku || "",
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        stock_actual: initialData.stock_actual?.toString() || "0",
        stock_minimo: initialData.stock_minimo?.toString() || "10",
        precio_costo: initialData.precio_costo?.toString() || "0",
        precio_venta: initialData.precio_venta?.toString() || "0",
      })
    } else if (isOpen) {
      setFormData({
        sku: "",
        nombre: "",
        descripcion: "",
        stock_actual: "0",
        stock_minimo: "10",
        precio_costo: "0",
        precio_venta: "0",
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Convert numeric fields back to numbers for the API
      const processedData = {
        ...formData,
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        precio_costo: parseFloat(formData.precio_costo) || 0,
        precio_venta: parseFloat(formData.precio_venta) || 0,
      }
      await onSave(processedData)
      onClose()
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            style={{ background: 'rgba(12,12,28,0.98)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', padding: '2rem' }}
          >
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {initialData ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button onClick={onClose} className="btn-icon"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }} className="flex items-center gap-1">
                    SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="input-base"
                    placeholder="WMS-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }} className="flex items-center gap-1">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="input-base"
                    placeholder="Nombre del ítem"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  Descripción <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  className="input-base"
                  placeholder="Detalles técnicos, materiales o especificaciones..."
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }} className="flex items-center gap-1">
                    Stock Inicial <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="input-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }} className="flex items-center gap-1">
                    Mínimo Alerta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="input-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }} className="flex items-center gap-1">
                    Precio Costo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.precio_costo}
                    onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }} className="flex items-center gap-1">
                    Precio Venta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button disabled={loading} type="submit" className="btn-primary">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Guardar Producto
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
