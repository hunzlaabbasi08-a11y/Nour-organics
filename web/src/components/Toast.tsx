import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Toast = { id: number; message: string }

let pushToast: ((message: string) => void) | null = null

export function notify(message: string) {
  pushToast?.(message)
}

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    pushToast = (message) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, message }])
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 2800)
    }
    return () => {
      pushToast = null
    }
  }, [])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="toast-host" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.message}
        </div>
      ))}
    </div>,
    document.body,
  )
}
