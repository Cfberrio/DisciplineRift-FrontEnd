"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Coupon } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ticket, Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react"

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newPercentage, setNewPercentage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchCoupons()
  }, [])

  const checkAuthAndFetchCoupons = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push("/dashboard/login")
        return
      }

      await fetchCoupons()
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/dashboard/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchCoupons = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch("/api/coupons/list", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        console.error("Error fetching coupons:", await response.text())
        return
      }

      const { coupons: couponsData } = await response.json()
      setCoupons(couponsData || [])
    } catch (error) {
      console.error("Fetch coupons error:", error)
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newCode.trim()) {
      setError("El código es requerido")
      return
    }

    const percentage = parseInt(newPercentage)
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError("El porcentaje debe estar entre 0 y 100")
      return
    }

    setCreating(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("No hay sesión activa")
        return
      }

      const response = await fetch("/api/coupons/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: newCode,
          percentage: percentage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Error al crear el cupón")
        return
      }

      setNewCode("")
      setNewPercentage("")
      setShowForm(false)
      await fetchCoupons()
    } catch (error) {
      console.error("Create coupon error:", error)
      setError("Error inesperado al crear el cupón")
    } finally {
      setCreating(false)
    }
  }

  const handleToggleCoupon = async (couponid: string, currentStatus: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch("/api/coupons/toggle", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          couponid,
          isactive: !currentStatus
        })
      })

      if (!response.ok) {
        console.error("Error toggling coupon:", await response.text())
        return
      }

      await fetchCoupons()
    } catch (error) {
      console.error("Toggle coupon error:", error)
    }
  }

  const activeCoupons = coupons.filter(c => c.isactive)
  const inactiveCoupons = coupons.filter(c => !c.isactive)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0085B7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cupones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Gestión de Cupones</h1>
        <p className="text-lg text-gray-600">Administra los códigos de descuento para tus programas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md border-2 border-green-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Cupones Activos</p>
          <p className="text-4xl font-bold text-gray-900">{activeCoupons.length}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gray-100 rounded-xl">
              <TrendingDown className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Cupones Inactivos</p>
          <p className="text-4xl font-bold text-gray-900">{inactiveCoupons.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#0085B7] to-[#006B94] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Ticket className="h-6 w-6 mr-3" />
            Cupones
          </h2>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-[#0085B7] hover:bg-gray-100"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Cupón
          </Button>
        </div>

        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código del Cupón</Label>
                  <Input
                    id="code"
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="DESCUENTO25"
                    className="mt-1"
                    disabled={creating}
                  />
                </div>
                <div>
                  <Label htmlFor="percentage">Porcentaje de Descuento (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={newPercentage}
                    onChange={(e) => setNewPercentage(e.target.value)}
                    placeholder="25"
                    className="mt-1"
                    disabled={creating}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-[#0085B7] hover:bg-[#006B94]"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Cupón
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setNewCode("")
                    setNewPercentage("")
                    setError("")
                  }}
                  disabled={creating}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6">
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay cupones creados</p>
              <p className="text-gray-400 text-sm mt-2">Crea tu primer cupón para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.couponid}
                  className={`border-2 rounded-xl p-5 transition-all ${
                    coupon.isactive
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          coupon.isactive ? 'bg-green-100' : 'bg-gray-200'
                        }`}
                      >
                        <Ticket
                          className={`h-6 w-6 ${
                            coupon.isactive ? 'text-green-600' : 'text-gray-500'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{coupon.code}</h3>
                        <p className="text-sm text-gray-600">
                          Descuento: <span className="font-bold text-[#0085B7]">{coupon.percentage}%</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Creado: {new Date(coupon.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          coupon.isactive
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                        {coupon.isactive ? 'Activo' : 'Inactivo'}
                      </span>
                      <Button
                        onClick={() => handleToggleCoupon(coupon.couponid, coupon.isactive)}
                        variant="outline"
                        className={
                          coupon.isactive
                            ? 'border-red-500 text-red-600 hover:bg-red-50'
                            : 'border-green-500 text-green-600 hover:bg-green-50'
                        }
                      >
                        {coupon.isactive ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
