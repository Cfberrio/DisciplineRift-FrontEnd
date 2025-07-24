import { supabase } from "./supabase"

// Admin user credentials (en producción deberían estar en variables de entorno)
const ADMIN_CREDENTIALS = {
  email: "admin@disciplinerift.com",
  password: "admin123",
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin'
  isAuthenticated: boolean
}

export async function authenticateAdmin(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    // Verificar credenciales de administrador
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return { success: false, error: "Credenciales de administrador inválidas" }
    }

    // Si las credenciales son correctas, crear sesión de administrador
    const adminUser: AdminUser = {
      id: "admin-user",
      email: email,
      role: 'admin',
      isAuthenticated: true
    }

    // Guardar en localStorage para persistencia
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_session', JSON.stringify(adminUser))
    }

    return { success: true, user: adminUser }
  } catch (error) {
    console.error("Error en autenticación de administrador:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const session = localStorage.getItem('admin_session')
    if (!session) return null
    
    const adminUser = JSON.parse(session) as AdminUser
    return adminUser.isAuthenticated ? adminUser : null
  } catch (error) {
    console.error("Error al obtener sesión de administrador:", error)
    return null
  }
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_session')
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null
} 