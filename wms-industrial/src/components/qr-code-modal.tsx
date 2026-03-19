"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Printer, Download } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useRef } from "react"

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
}

export function QRCodeModal({ isOpen, onClose, product }: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = qrRef.current
    if (!printContent) return

    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
    if (!windowPrint) return

    windowPrint.document.write(`
      <html>
        <head>
          <title>Imprimir QR - ${product.sku}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .label { text-align: center; border: 2px solid #000; padding: 20px; border-radius: 10px; }
            .sku { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .name { font-size: 16px; color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="sku">${product.sku}</div>
            ${printContent.innerHTML}
            <div class="name">${product.nombre}</div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `)
    windowPrint.document.close()
    windowPrint.focus()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
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
              position: 'relative', width: '100%', maxWidth: '380px', zIndex: 1,
              background: 'rgba(12,12,28,0.98)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '24px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', padding: '2rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Etiqueta QR</h2>
              <button onClick={onClose} className="btn-icon"><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div 
                ref={qrRef}
                style={{ 
                  background: '#fff', padding: '1.5rem', borderRadius: '16px', 
                  boxShadow: '0 0 0 1px rgba(108,99,255,0.1), 0 20px 40px rgba(0,0,0,0.2)' 
                }}
              >
                <QRCodeSVG 
                  value={product.sku} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{product.sku}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{product.nombre}</div>
              </div>

              <div style={{ display: 'flex', width: '100%', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handlePrint}
                  className="btn-primary" 
                  style={{ flex: 1, justifyContent: 'center', height: '48px' }}
                >
                  <Printer size={18} /> Imprimir
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center', height: '48px' }}
                  onClick={() => {
                    const svg = qrRef.current?.querySelector('svg');
                    if (!svg) return;
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx?.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL("image/png");
                      const downloadLink = document.createElement("a");
                      downloadLink.download = `QR-${product.sku}.png`;
                      downloadLink.href = pngFile;
                      downloadLink.click();
                    };
                    img.src = "data:image/svg+xml;base64," + btoa(svgData);
                  }}
                >
                  <Download size={18} /> PNG
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
