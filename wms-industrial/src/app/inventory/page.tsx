"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  AlertTriangle,
  Edit2,
  Trash2,
  Loader2,
  ArrowRightLeft,
  QrCode
} from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useInventory, useEmpresa, useProfile } from "@/hooks/useInventory"
import { AddProductModal } from "@/components/add-product-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { StockMovementModal } from "@/components/stock-movement-modal"
import { QRCodeModal } from "@/components/qr-code-modal"

export default function InventoryPage() {
  const { products, isLoading, createProduct, updateProduct, deleteProduct, addTransaction } = useInventory()
  const { currencySymbol } = useEmpresa()
  const { isAdmin } = useProfile()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [movementProduct, setMovementProduct] = useState<any>(null)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [qrProduct, setQRProduct] = useState<any>(null)

  const filteredProducts = products?.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleMovementClick = (product: any) => {
    setMovementProduct(product)
    setIsMovementModalOpen(true)
  }

  const handleQRClick = (product: any) => {
    setQRProduct(product)
    setIsQRModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    try {
      await deleteProduct.mutateAsync(productToDelete.id)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      alert("Producto eliminado exitosamente.")
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error al eliminar el producto. Puede que tenga transacciones asociadas que lo bloqueen.")
    }
  }

  const handleMovementConfirm = async (data: any) => {
    if (!movementProduct) return
    try {
      const { data: empresa } = await supabase
        .from('empresa')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (!empresa?.id) {
        alert("Configura tu empresa primero.")
        return
      }

      await addTransaction.mutateAsync({
        producto_id: movementProduct.id,
        empresa_id: empresa.id,
        ...data
      })
      alert("¡Movimiento registrado exitosamente!")
    } catch (error) {
      console.error("Error registering movement:", error)
      alert("Error al registrar movimiento.")
    }
  }

  const handleSave = async (formData: any) => {
    try {
      if (editingProduct) {
        // Modo Edición
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          ...formData
        })
        alert("¡Producto actualizado exitosamente!")
      } else {
        // Modo Creación
        const { data: empresa, error: empresaError } = await supabase
          .from('empresa')
          .select('id')
          .limit(1)
          .maybeSingle()
        
        if (empresaError && empresaError.code !== 'PGRST116') throw empresaError

        if (empresa?.id) {
          // 1. Crear producto con stock inicial 0 (el trigger lo aumentará)
          const newProduct = await createProduct.mutateAsync({
            ...formData,
            stock_actual: 0,
            empresa_id: empresa.id
          })
          
          if (newProduct && newProduct.length > 0 && formData.stock_actual > 0) {
            // 2. Registrar transacción para que aparezca en el Dashboard
            await addTransaction.mutateAsync({
              producto_id: newProduct[0].id,
              tipo: 'ENTRADA',
              cantidad: formData.stock_actual,
              motivo: 'Registro de Stock Inicial',
              empresa_id: empresa.id
            })
          }
          
          alert("¡Producto creado exitosamente!")
        } else {
          alert("⚠️ ATENCIÓN: Primero debes configurar tu empresa.")
        }
      }
      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar el producto.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }} 
        onSave={handleSave}
        initialData={editingProduct}
      />
      
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setProductToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Producto?"
        message={`Esta acción eliminará permanentemente el producto "${productToDelete?.nombre}" y todo su historial de movimientos. ¿Estás seguro?`}
      />

      <StockMovementModal 
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false)
          setMovementProduct(null)
        }}
        product={movementProduct}
        onConfirm={handleMovementConfirm}
      />
      
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between page-header">
        <div>
          <h1 className="page-title">Inventario Maestro</h1>
          <p className="page-subtitle">Datos reales vinculados a PostgreSQL.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <Download size={16} />
            Exportar
          </button>
          <button 
            onClick={() => {
              setEditingProduct(null)
              setIsModalOpen(true)
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="input-base pl-9"
            style={{ background: 'rgba(255,255,255,0.03)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right' }}>P. Venta</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 500 }}>
                      {product.sku}
                    </span>
                  </td>
                  <td>
                    <div className="font-600" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{product.descripcion || 'Sin descripción'}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span style={{ 
                        fontFamily: 'JetBrains Mono, monospace', 
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: product.stock_actual <= product.stock_minimo ? 'var(--status-danger)' : 'var(--text-primary)' 
                      }}>
                        {product.stock_actual}
                      </span>
                      {product.stock_actual <= product.stock_minimo && (
                        <span className="badge badge-danger" style={{ fontSize: '0.6rem', padding: '0.1rem 0.45rem' }}>
                          <AlertTriangle size={10} /> mínimo
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currencySymbol}{Number(product.precio_venta).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleMovementClick(product)}
                        className="btn-icon"
                        title="Registrar Movimiento"
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                      <button 
                        onClick={() => handleQRClick(product)}
                        className="btn-icon"
                        title="Generar QR"
                      >
                        <QrCode size={14} />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="btn-icon"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteClick(product)}
                        className="btn-icon danger"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
            No hay productos cargados en la base de datos.
          </div>
        )}
      </div>
      <QRCodeModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        product={qrProduct}
      />
    </div>
  )
}
