"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Mail, Loader2, Warehouse, Eye, EyeOff } from "lucide-react"
import { supabase } from "../../lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) throw error
      router.replace("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error en la autenticación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100svh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.18), transparent), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(167,139,250,0.08), transparent)',
      padding: '1.5rem'
    }}>
      {/* Decorative orbs */}
      <div style={{ 
        position: 'fixed', top: '20%', left: '15%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />
      <div style={{ 
        position: 'fixed', bottom: '20%', right: '15%', width: '250px', height: '250px',
        background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ 
          width: '100%', 
          maxWidth: '380px',
          background: 'rgba(15, 15, 30, 0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.1)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ 
              display: 'inline-flex', 
              width: '56px', height: '56px',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
              marginBottom: '1.25rem'
            }}
          >
            <Warehouse size={26} color="#fff" />
          </motion.div>
          <h1 style={{ 
            fontWeight: 800, 
            fontSize: '1.5rem', 
            letterSpacing: '-0.02em', 
            color: 'var(--text-primary)',
            margin: '0.5rem 0 0.25rem 0',
            lineHeight: 1.2
          }}>Sistema de inventarios</h1>
          <p style={{ 
            marginTop: '0.35rem', fontSize: '0.8rem', 
            color: 'var(--text-muted)', letterSpacing: '0.08em', 
            textTransform: 'uppercase', fontWeight: 600 
          }}>Sistema Restringido</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div>
            <label style={{ 
              display: 'block', marginBottom: '0.45rem', 
              fontSize: '0.7rem', fontWeight: 700, 
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' 
            }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ 
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                required
                type="email"
                className="input-base"
                style={{ paddingLeft: '38px' }}
                placeholder="usuario@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ 
              display: 'block', marginBottom: '0.45rem', 
              fontSize: '0.7rem', fontWeight: 700, 
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' 
            }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ 
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                required
                type={showPass ? "text" : "password"}
                className="input-base"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ 
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  padding: 0, display: 'flex'
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(244,63,112,0.1)',
                border: '1px solid rgba(244,63,112,0.25)',
                borderRadius: '10px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.8rem',
                color: 'var(--status-danger)',
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            disabled={loading}
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.9rem' }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Iniciar Sesión"}
          </button>
        </form>

        <p style={{ 
          marginTop: '1.5rem', textAlign: 'center', 
          fontSize: '0.7rem', color: 'var(--text-muted)', 
          letterSpacing: '0.04em' 
        }}>
          Solo Personal Autorizado
        </p>
      </motion.div>
    </div>
  )
}
