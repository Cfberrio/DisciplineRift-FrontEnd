"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, X } from "lucide-react"

export default function SuccessMessageHandler() {
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    const enrollment = searchParams.get("enrollment")
    if (enrollment === "success") {
      setShowSuccessMessage(true)
    }
  }, [searchParams])

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false)
    // Clean URL by removing query parameters
    window.history.replaceState({}, document.title, "/")
  }

  if (!showSuccessMessage) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
        <button
          onClick={handleCloseSuccessMessage}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              ¡Registro Exitoso!
            </h3>
            <p className="text-gray-600 mt-1">
              Tu inscripción ha sido completada correctamente.
            </p>
          </div>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <p>✅ Pago procesado exitosamente</p>
          <p>✅ Confirmación enviada por email</p>
          <p>✅ Acceso al dashboard activado</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={handleCloseSuccessMessage}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Continuar
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/dashboard"}
            className="flex-1"
          >
            Ver Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
} 