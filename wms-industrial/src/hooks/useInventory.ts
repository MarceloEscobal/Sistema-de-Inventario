import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type Product = {
  id: string
  sku: string
  nombre: string
  descripcion: string | null
  categoria_id: string | null
  stock_actual: number
  stock_minimo: number
  precio_costo: number
  precio_venta: number
  proveedor_id: string | null
  empresa_id: string
  updated_at: string
}

export function useInventory() {
  const queryClient = useQueryClient()

  const { profile, user } = useProfile()

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', profile?.empresa_id],
    enabled: !!profile?.empresa_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('empresa_id', profile?.empresa_id)
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return data as Product[]
    }
  })

  const createProduct = useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const addTransaction = useMutation({
    mutationFn: async (transaction: {
      producto_id: string
      tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'
      cantidad: number
      motivo: string
      empresa_id: string
    }) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          usuario_id: user?.id,
          usuario_email: user?.email
        }])
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })

  return { products, isLoading, error, createProduct, updateProduct, deleteProduct, addTransaction }
}

export function useTransactions() {
  const { profile } = useProfile()

  return useQuery({
    queryKey: ['transactions', profile?.empresa_id],
    enabled: !!profile?.empresa_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log_view')
        .select('*')
        .eq('empresa_id', profile?.empresa_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })
}
export function useUpdateEmpresa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updates: { id?: string; nombre?: string; moneda?: string; zona_horaria?: string }) => {
      const { data, error } = await supabase
        .from('empresa')
        .upsert(updates)
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-info'] })
    }
  })
}

export function useEmpresa() {
  const { profile } = useProfile()

  const { data: empresa, isLoading } = useQuery({
    queryKey: ['empresa', profile?.empresa_id],
    enabled: !!profile?.empresa_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .eq('id', profile?.empresa_id)
        .single()
      
      if (error) throw error
      return data
    }
  })

  // Helper para obtener el símbolo de moneda
  const currencySymbol = useMemo(() => {
    if (!empresa?.moneda) return '$'
    const match = empresa.moneda.match(/\(([^)]+)\)/)
    return match ? match[1] : '$'
  }, [empresa?.moneda])

  return { empresa, isLoading, currencySymbol }
}

export function useProfile() {
  const queryClient = useQueryClient()

  // Escuchar cambios de autenticación para LIMPIAR TODO EL CACHE
  useMemo(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        // Limpiar absolutamente todo para evitar filtraciones de datos entre cuentas
        queryClient.clear()
        queryClient.invalidateQueries()
      }
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user || null
    },
    staleTime: 1000 * 60 * 5, // Cache de 5 min para la sesión
  })

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle()
      
      if (error) throw error
      return data
    }
  })

  const isAdmin = profile?.role === 'ADMIN'
  const isInventariador = profile?.role === 'INVENTARIADOR'
  const isSuperAdmin = isAdmin && user?.email?.toLowerCase() === 'sistema_inv@inv.com'

  // El estado de carga es real cuando estamos buscando el usuario 
  // O cuando tenemos usuario pero aún estamos buscando su perfil
  const isLoading = isLoadingUser || (!!user && isLoadingProfile)

  return { profile, user, isLoading, isAdmin, isInventariador, isSuperAdmin }
}
