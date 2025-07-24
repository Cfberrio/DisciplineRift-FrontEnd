"use client"

import { useEffect } from "react"

export default function V0ServiceWorkerFix() {
  useEffect(() => {
    // Only run in v0 preview environment
    if (typeof window !== "undefined" && window.location.hostname.includes("vusercontent.net")) {
      // Unregister the v0 service worker to prevent console errors
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            if (registration.scope.includes("vusercontent.net")) {
              registration.unregister()
            }
          })
        })
      }
    }
  }, [])

  return null
}
