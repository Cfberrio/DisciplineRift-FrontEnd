"use client"

import { useEffect, useState } from "react"
import { getSupabaseStatus } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface SupabaseStatusProps {
  showOnlyErrors?: boolean
}

export default function SupabaseStatus({ showOnlyErrors = false }: SupabaseStatusProps) {
  const [status, setStatus] = useState<any>(null)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const checkStatus = () => {
      const supabaseStatus = getSupabaseStatus()
      setStatus(supabaseStatus)

      // Show status if there are issues or if not configured to show only errors
      if (!supabaseStatus.configured || !showOnlyErrors) {
        setShowStatus(true)
      }
    }

    checkStatus()
  }, [showOnlyErrors])

  if (!showStatus || !status) {
    return null
  }

  // Don't show anything if everything is configured and we only want to show errors
  if (showOnlyErrors && status.configured) {
    return null
  }

  const getStatusIcon = () => {
    if (status.configured && status.ready) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else if (status.hasUrl || status.hasAnonKey) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusMessage = () => {
    if (status.configured && status.ready) {
      return "Supabase is properly configured and ready"
    } else if (!status.hasUrl && !status.hasAnonKey) {
      return "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    } else if (!status.hasUrl) {
      return "Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
    } else if (!status.hasAnonKey) {
      return "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable"
    } else {
      return "Supabase configuration incomplete"
    }
  }

  const getAlertVariant = () => {
    if (status.configured && status.ready) {
      return "default"
    } else {
      return "destructive"
    }
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <Alert variant={getAlertVariant()}>
        {getStatusIcon()}
        <AlertDescription className="ml-2">
          {getStatusMessage()}
          {!status.configured && (
            <div className="mt-2 text-xs opacity-75">
              Authentication and database features will not work until properly configured.
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}
