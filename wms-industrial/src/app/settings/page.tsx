"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Users, 
  Globe,
  Save,
  ChevronRight,
  Loader2
} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { cn } from "../../lib/utils"
import { useUpdateEmpresa, useProfile } from "../../hooks/useInventory"
import { useRouter } from "next/navigation"

const sections = [
  { name: "General", icon: Settings, desc: "Configuración de empresa, moneda y zona horaria." },
  { name: "Seguridad", icon: Shield, desc: "Gestión de roles y políticas de acceso RLS." },
  { name: "Notificaciones", icon: Bell, desc: "Canales de alerta y umbrales de stock." },
  { name: "Base de Datos", icon: Database, desc: "Sincronización con Supabase y backups." },
  { name: "Equipo", icon: Users, desc: "Gestión de usuarios y perfiles operativos." },
]

export default function SettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const updateEmpresa = useUpdateEmpresa()
  const { profile, isAdmin, isLoading: loadingProfile } = useProfile()
  const [expandedSection, setExpandedSection] = useState<string | null>("General")

  useEffect(() => {
    if (!loadingProfile && profile && !isAdmin) {
      router.push('/inventory')
    }
  }, [profile, isAdmin, loadingProfile, router])
  const [formData, setFormData] = useState({
    nombre: "",
    zona_horaria: "América/Bogotá (GMT-5)",
    moneda: "USD ($)"
  })

  const { data: empresa, isLoading } = useQuery({
    queryKey: ['empresa-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .limit(1)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') return null
      return data
    }
  })

  useEffect(() => {
    if (empresa) {
      setFormData({ 
        nombre: empresa.nombre || "",
        moneda: empresa.moneda || "USD ($)",
        zona_horaria: empresa.zona_horaria || "América/Bogotá (GMT-5)"
      })
    }
  }, [empresa])

  const handleSave = async () => {
    try {
      const payload: any = {
        nombre: formData.nombre,
        moneda: formData.moneda,
        zona_horaria: formData.zona_horaria
      }
      
      if (empresa?.id) {
        payload.id = empresa.id
      }

      await updateEmpresa.mutateAsync(payload)
      alert("Configuración guardada exitosamente en Supabase")
    } catch (error) {
      console.error("Error updating settings:", error)
      alert("Error al guardar los cambios. Asegúrate de haber ejecutado los cambios en la BD.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Administra los parámetros técnicos y operativos del WMS.</p>
        </div>
        <button onClick={handleSave} disabled={updateEmpresa.isPending} className="btn-primary">
          {updateEmpresa.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar Cambios
        </button>
      </div>

      <div className="grid gap-4">
        {sections.map((section, index) => {
          const isExpanded = expandedSection === section.name
          return (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isExpanded ? "border-[var(--accent-primary)] bg-slate-900/80" : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/40"
              )}
            >
              <div 
                onClick={() => setExpandedSection(isExpanded ? null : section.name)}
                className="flex items-center justify-between p-6 cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "rounded-xl p-3 transition-all shadow-inner",
                    isExpanded ? "text-white" : "text-[var(--accent-secondary)]"
                  )} style={{ background: isExpanded ? 'var(--gradient-primary)' : 'var(--accent-subtle)' }}>
                    <section.icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{section.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{section.desc}</p>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={cn(
                    "text-slate-600 transition-all",
                    isExpanded ? "rotate-90 text-white" : ""
                  )} 
                />
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-800 overflow-hidden"
                  >
                    <div className="p-8 space-y-6">
                      {section.name === "General" ? (
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nombre de la Empresa</label>
                            <input 
                              type="text" 
                              value={formData.nombre}
                              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                              className="input-base"
                              placeholder="Ej: WMS Industries"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Moneda Base</label>
                            <select 
                              value={formData.moneda}
                              onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                              <option>USD ($)</option>
                              <option>EUR (€)</option>
                              <option>PEN (S/.)</option>
                              <option>COP ($)</option>
                              <option>CLP ($)</option>
                              <option>MXN ($)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Zona Horaria</label>
                            <select 
                              value={formData.zona_horaria}
                              onChange={(e) => setFormData({ ...formData, zona_horaria: e.target.value })}
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                              <option>América/Bogotá (GMT-5)</option>
                              <option>América/Santiago (GMT-4)</option>
                              <option>América/Mexico_City (GMT-6)</option>
                              <option>Europa/Madrid (GMT+1)</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="py-10 text-center text-slate-500 italic">
                          Esta sección se configura mediante políticas de Supabase directamente.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <div className={cn(
        "rounded-2xl border p-8 space-y-4 transition-colors",
        empresa?.id ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"
      )}>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Database size={22} className={empresa?.id ? "text-emerald-500" : "text-rose-500"} />
          Estado de Sincronización
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 italic">ID del Entorno: {empresa?.id || (isLoading ? "Verificando..." : "Sincronizando por primera vez...")}</span>
          <span className={cn(
            "flex items-center gap-2 font-mono",
            empresa?.id ? "text-emerald-500" : "text-amber-500"
          )}>
            <span className={cn(
              "h-2 w-2 rounded-full",
              empresa?.id ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            )} />
            {empresa?.id ? "VINCULADO A POSTGRESQL" : "ESPERANDO CONFIGURACIÓN"}
          </span>
        </div>
      </div>
    </div>
  )
}
