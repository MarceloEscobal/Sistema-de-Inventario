"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, UserPlus, Loader2, Mail, Lock, Shield } from "lucide-react"
import { useStaff } from "../hooks/useStaff"
import { useProfile } from "../hooks/useInventory"

interface AddStaffModalProps {
  isOpen: boolean
  onClose: () => void
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 50,
  background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
}
const modalCard: React.CSSProperties = {
  position: 'relative', width: '100%', maxWidth: '420px',
  background: 'rgba(12,12,28,0.98)', border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1)',
  overflow: 'hidden'
}
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.4rem', fontSize: '0.68rem',
  fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em'
}
const iconWrap: React.CSSProperties = {
  position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
  color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex'
}

export function AddStaffModal({ isOpen, onClose }: AddStaffModalProps) {
  const { profile } = useProfile()
  const { createStaff } = useStaff()
  const [formData, setFormData] = useState({ email: "", password: "", role: "INVENTARIADOR" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createStaff.mutateAsync({ ...formData, empresa_id: profile?.empresa_id })
      onClose()
      setFormData({ email: "", password: "", role: "INVENTARIADOR" })
    } catch (error: any) {
      alert(`Error al crear la cuenta: ${error.message || 'Error desconocido'}`)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={modalOverlay} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Nueva Cuenta</h2>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Registrar nuevo personal al sistema.</p>
                </div>
              </div>
              <button onClick={onClose} className="btn-icon"><X size={16} /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconWrap}><Mail size={14} /></span>
                  <input required type="email" className="input-base" style={{ paddingLeft: '34px' }}
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="ejemplo@empresa.com" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Contraseña Provisional</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconWrap}><Lock size={14} /></span>
                  <input required type="password" minLength={6} className="input-base" style={{ paddingLeft: '34px' }}
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Rol del Personal</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconWrap}><Shield size={14} /></span>
                  <select className="input-base" style={{ paddingLeft: '34px', appearance: 'none', cursor: 'pointer' }}
                    value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="INVENTARIADOR">Inventariador (Gestión de Stock)</option>
                    <option value="ADMIN">Administrador (Acceso Total)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.5rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                <button type="submit" disabled={createStaff.isPending} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {createStaff.isPending ? <Loader2 size={16} className="animate-spin" /> : "Crear Cuenta"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
