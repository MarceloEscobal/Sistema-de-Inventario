import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useProfile } from './useInventory'

export type StaffMember = {
  id: string
  email: string
  role: 'ADMIN' | 'INVENTARIADOR' | 'OPERADOR'
  created_at: string
  empresa_id: string
}

export function useStaff() {
  const queryClient = useQueryClient()
  const { profile } = useProfile()

  const { data: staff, isLoading, error } = useQuery({
    queryKey: ['staff-list', profile?.empresa_id],
    enabled: !!profile?.empresa_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_list')
        .select('*')
        .eq('empresa_id', profile?.empresa_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as StaffMember[]
    }
  })

  const createStaff = useMutation({
    mutationFn: async ({ email, password, role, empresa_id }: any) => {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, empresa_id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al crear usuario')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] })
    }
  })

  const updateStaff = useMutation({
    mutationFn: async ({ id, email, password, role }: any) => {
      const { data, error } = await supabase.rpc('admin_update_user', {
        p_user_id: id,
        p_email: email,
        p_password: password,
        p_role: role
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] })
    }
  })

  const deleteStaff = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al eliminar usuario')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] })
    }
  })

  return { staff, isLoading, error, createStaff, updateStaff, deleteStaff }
}
