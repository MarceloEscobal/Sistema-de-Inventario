"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) {
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
              position: 'relative', width: '100%', maxWidth: '400px', zIndex: 1,
              background: 'rgba(12,12,28,0.98)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(244,63,112,0.1)',
              padding: '2rem'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '50%', marginBottom: '1.25rem',
                background: 'rgba(244,63,112,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--status-danger)'
              }}>
                <AlertTriangle size={28} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>{title}</h2>
              <p style={{ margin: '0 0 1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
              <div style={{ display: 'flex', width: '100%', gap: '0.65rem' }}>
                <button onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                <button onClick={onConfirm} className="btn-danger" style={{ flex: 1, justifyContent: 'center' }}>Confirmar Eliminar</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
