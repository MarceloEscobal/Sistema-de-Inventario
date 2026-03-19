"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Calendar, 
  Search, 
  Loader2,
  MoreVertical,
  UserCheck,
  UserX,
  UserCog
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useStaff, StaffMember } from "../../hooks/useStaff"
import { useProfile } from "../../hooks/useInventory"
import { useRouter } from "next/navigation"
import { AddStaffModal } from "../../components/add-staff-modal"
import { EditStaffModal } from "../../components/edit-staff-modal"

export default function StaffPage() {
  const router = useRouter()
  const { staff, isLoading: loadingStaff, deleteStaff } = useStaff()
  const { profile, isSuperAdmin, isLoading: loadingProfile } = useProfile()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null)

  // Redirigir si no es Super Admin
  useEffect(() => {
    if (!loadingProfile && profile && !isSuperAdmin) {
      router.push('/inventory')
    }
  }, [profile, isSuperAdmin, loadingProfile, router])

  const handleEdit = (member: StaffMember) => {
    setSelectedMember(member)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: string, email: string) => {
    if (email === 'sistema_inv@inv.com') {
      alert("No puedes eliminar la cuenta del Súper Administrador.")
      return
    }
    if (confirm(`¿Estás seguro de que deseas eliminar la cuenta de ${email}?`)) {
      try {
        await deleteStaff.mutateAsync(id)
      } catch (error) {
        alert("Error al eliminar el usuario.")
      }
    }
  }

  const filteredStaff = staff?.filter(member => 
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loadingProfile || loadingStaff) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    )
  }

  if (!isSuperAdmin) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between page-header">
        <div>
          <h1 className="page-title">Gestión de Personal</h1>
          <p className="page-subtitle">Administra las cuentas y niveles de acceso de tu equipo.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <UserPlus size={16} />
          Nueva Cuenta
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Buscar por correo..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-base pl-9" style={{ background: 'rgba(255,255,255,0.03)' }} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Perfil</th>
                <th>Rol</th>
                <th>Fecha de Alta</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff?.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)', flexShrink: 0 }}>
                        <Users size={17} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{member.email.split('@')[0]}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                          <Mail size={11} /> {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={member.role === 'ADMIN' ? 'badge badge-violet' : 'badge badge-info'}>
                      <Shield size={10} />{member.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={13} />{new Date(member.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button onClick={() => handleEdit(member)} className="btn-icon" title="Editar">
                        <UserCog size={15} />
                      </button>
                      {member.email !== 'sistema_inv@inv.com' && (
                        <button onClick={() => handleDelete(member.id, member.email)} className="btn-icon danger" title="Eliminar">
                          <UserX size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {(!filteredStaff || filteredStaff.length === 0) && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No se encontró personal.
            </div>
          )}
        </div>
      </div>

      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={selectedMember}
      />
    </div>
  )
}
