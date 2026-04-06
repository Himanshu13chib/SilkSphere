import React from 'react'
import { useApp } from '../../context/AppContext'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()
  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = ICONS[t.type] || Info
        return (
          <div key={t.id} className={`toast ${t.type}`}>
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
