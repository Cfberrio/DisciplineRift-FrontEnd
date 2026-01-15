"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Users, Calendar, CreditCard, Settings, Menu, X, LogOut, Target } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

interface ParentData {
  firstname: string
  lastname: string
  email: string
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/players", label: "My Players", icon: Users },
  { href: "/dashboard/skills", label: "Skills & Tiers", icon: Target },
  { href: "/dashboard/schedule", label: "Schedule", icon: Calendar },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [parentData, setParentData] = useState<ParentData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Si estamos en la página de login, no mostrar el layout con sidebar
  const isLoginPage = pathname === "/dashboard/login"

  useEffect(() => {
    if (!isLoginPage) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [isLoginPage])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push("/dashboard/login")
        return
      }

      // Get parent data
      const { data: parent } = await supabase
        .from("parent")
        .select("firstname, lastname, email")
        .eq("parentid", user.id)
        .single()

      if (parent) {
        setParentData(parent)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Si es la página de login, renderizar solo children sin sidebar ni auth check
  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0085B7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="ml-3 text-lg font-bold" style={{ color: '#0085B7' }}>
            Discipline Rift
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
            <Link href="/" className="text-xl font-bold" style={{ color: '#0085B7' }}>
              Discipline Rift
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-700 hover:text-white hover:bg-[#0085B7]'
                          }`}
                          style={isActive ? { backgroundColor: '#0085B7' } : {}}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>

              {/* User Info & Logout */}
              <li className="mt-auto pb-4">
                <div className="flex items-center gap-x-4 px-3 py-3 border-t border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {parentData?.firstname} {parentData?.lastname}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {parentData?.email}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full mt-2 text-gray-700 hover:text-white hover:bg-red-600 hover:border-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white overflow-y-auto">
            <div className="flex grow flex-col gap-y-5 px-6 pb-4">
              {/* Logo */}
              <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
                <Link href="/" className="text-xl font-bold" style={{ color: '#0085B7' }}>
                  Discipline Rift
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors ${
                                isActive
                                  ? 'text-white'
                                  : 'text-gray-700 hover:text-white hover:bg-[#0085B7]'
                              }`}
                              style={isActive ? { backgroundColor: '#0085B7' } : {}}
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              {item.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </li>

                  {/* User Info & Logout */}
                  <li className="mt-auto">
                    <div className="flex items-center gap-x-4 px-3 py-3 border-t border-gray-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {parentData?.firstname} {parentData?.lastname}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {parentData?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full mt-2 text-gray-700 hover:text-white hover:bg-red-600 hover:border-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="pt-16 lg:pt-0">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
