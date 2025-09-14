"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  Calendar,
  MapPin,
  Phone,
  GraduationCap,
  Trophy,
  Clock,
  Users,
  FileText,
  Activity,
  Star,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Download,
  Bell,
  Settings,
  Heart,
  Award,
  Camera,
  LogOut,
  Shield,
} from "lucide-react"
import AdminLogin from "./admin-login"
import StudentManagement from "./student-management"
import EmailTestPanel from "./email-test-panel"
import CancellationManager from "./cancellation-manager"
import { getAdminSession, logoutAdmin, type AdminUser } from "@/lib/admin-auth"

// Mock data for demonstration
const mockChildren = [
  {
    id: 1,
    firstName: "Emma",
    lastName: "Johnson",
    age: 14,
    grade: "9th Grade",
    dateOfBirth: "2009-03-15",
    photo: null,
    emergencyContact: {
      name: "Sarah Johnson",
      phone: "(555) 123-4567",
      relationship: "Mother",
    },
    programs: [
      {
        id: 1,
        name: "Elite Volleyball Training",
        school: "Lincoln High School",
        location: "Downtown Sports Complex",
        status: "Active",
        startDate: "2024-01-15",
        endDate: "2024-06-15",
        schedule: "Mon, Wed, Fri - 4:00 PM to 6:00 PM",
        coach: "Coach Martinez",
        level: "Intermediate",
        progress: 85,
        nextSession: "2024-01-22 16:00",
        totalSessions: 48,
        attendedSessions: 41,
        fees: {
          total: 1200,
          paid: 800,
          remaining: 400,
          nextDue: "2024-02-01",
        },
      },
      {
        id: 2,
        name: "Summer Volleyball Camp",
        school: "Roosevelt Middle School",
        location: "Roosevelt Gymnasium",
        status: "Completed",
        startDate: "2023-06-01",
        endDate: "2023-08-15",
        schedule: "Daily - 9:00 AM to 3:00 PM",
        coach: "Coach Thompson",
        level: "Beginner",
        progress: 100,
        totalSessions: 30,
        attendedSessions: 28,
        fees: {
          total: 800,
          paid: 800,
          remaining: 0,
        },
      },
    ],
    achievements: [
      { title: "Most Improved Player", date: "2023-12-15", program: "Elite Training" },
      { title: "Perfect Attendance", date: "2023-08-15", program: "Summer Camp" },
    ],
    medicalInfo: {
      conditions: "Mild asthma",
      medications: "Albuterol inhaler as needed",
      allergies: "None",
      lastPhysical: "2023-08-01",
    },
    reports: [
      {
        id: 1,
        title: "Mid-Season Progress Report",
        date: "2024-01-15",
        type: "Progress",
        status: "Available",
      },
      {
        id: 2,
        title: "Skills Assessment",
        date: "2024-01-10",
        type: "Assessment",
        status: "Available",
      },
    ],
  },
  {
    id: 2,
    firstName: "Alex",
    lastName: "Johnson",
    age: 12,
    grade: "7th Grade",
    dateOfBirth: "2011-07-22",
    photo: null,
    emergencyContact: {
      name: "Sarah Johnson",
      phone: "(555) 123-4567",
      relationship: "Mother",
    },
    programs: [
      {
        id: 3,
        name: "Youth Development Program",
        school: "Central Middle School",
        location: "Central Gym",
        status: "Active",
        startDate: "2024-01-08",
        endDate: "2024-05-30",
        schedule: "Tue, Thu - 3:30 PM to 5:00 PM",
        coach: "Coach Davis",
        level: "Beginner",
        progress: 65,
        nextSession: "2024-01-23 15:30",
        totalSessions: 32,
        attendedSessions: 21,
        fees: {
          total: 600,
          paid: 300,
          remaining: 300,
          nextDue: "2024-02-15",
        },
      },
    ],
    achievements: [{ title: "Team Spirit Award", date: "2024-01-10", program: "Youth Development" }],
    medicalInfo: {
      conditions: "None",
      medications: "None",
      allergies: "Peanuts",
      lastPhysical: "2023-09-15",
    },
    reports: [
      {
        id: 3,
        title: "Initial Assessment",
        date: "2024-01-08",
        type: "Assessment",
        status: "Available",
      },
    ],
  },
]

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(mockChildren[0])
  const [activeTab, setActiveTab] = useState("students")
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Verificar autenticación de administrador al cargar
  useEffect(() => {
    const session = getAdminSession()
    setAdminUser(session)
    setIsCheckingAuth(false)
  }, [])

  // Manejar login exitoso
  const handleAdminLogin = (user: AdminUser) => {
    setAdminUser(user)
  }

  // Manejar logout
  const handleAdminLogout = () => {
    logoutAdmin()
    setAdminUser(null)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Mostrar pantalla de carga mientras se verifica autenticación
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Mostrar login si no está autenticado
  if (!adminUser) {
    return <AdminLogin onLoginSuccess={handleAdminLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 mr-3 text-blue-600" />
                Panel de Administración
              </h1>
              <p className="text-gray-600 mt-1">Gestión completa de estudiantes, equipos y registros</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">{adminUser.email}</span>
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificaciones
              </Button>
              <Button variant="outline" size="sm" onClick={handleAdminLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Children Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Children</span>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockChildren.map((child) => (
                  <div
                    key={child.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedChild.id === child.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {child.firstName[0]}
                          {child.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {child.firstName} {child.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Age {child.age} • {child.grade}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="flex space-x-1">
                            {child.programs.map((program) => (
                              <Badge
                                key={program.id}
                                variant="secondary"
                                className={`text-xs ${getStatusColor(program.status)}`}
                              >
                                {program.status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Child Header */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                        {selectedChild.firstName[0]}
                        {selectedChild.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedChild.firstName} {selectedChild.lastName}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Age {selectedChild.age}
                        </span>
                        <span className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          {selectedChild.grade}
                        </span>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Born {new Date(selectedChild.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="students">Estudiantes</TabsTrigger>
                <TabsTrigger value="programs">Programas</TabsTrigger>
                <TabsTrigger value="progress">Progreso</TabsTrigger>
                <TabsTrigger value="reports">Reportes</TabsTrigger>
                <TabsTrigger value="medical">Médico</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="cancellations">Cancelaciones</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {selectedChild.programs.filter((p) => p.status === "Active").length}
                          </p>
                          <p className="text-sm text-gray-600">Active Programs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold">{selectedChild.achievements.length}</p>
                          <p className="text-sm text-gray-600">Achievements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {selectedChild.programs.reduce((acc, p) => acc + (p.attendedSessions || 0), 0)}
                          </p>
                          <p className="text-sm text-gray-600">Sessions Attended</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {Math.round(
                              selectedChild.programs.reduce((acc, p) => acc + p.progress, 0) /
                                selectedChild.programs.length,
                            )}
                            %
                          </p>
                          <p className="text-sm text-gray-600">Avg Progress</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Programs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Programs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedChild.programs
                        .filter((p) => p.status === "Active")
                        .map((program) => (
                          <div key={program.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">{program.name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {program.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {program.coach}
                                  </span>
                                  <Badge variant="secondary">{program.level}</Badge>
                                </div>
                              </div>
                              <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Schedule</p>
                                <p className="text-sm text-gray-600">{program.schedule}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Next Session</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(program.nextSession).toLocaleDateString()} at{" "}
                                  {new Date(program.nextSession).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Attendance</p>
                                <p className="text-sm text-gray-600">
                                  {program.attendedSessions}/{program.totalSessions} sessions
                                </p>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{program.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(program.progress)}`}
                                  style={{ width: `${program.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {program.fees.remaining > 0 && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <div className="flex items-center">
                                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                                  <span className="text-sm text-yellow-800">
                                    Payment due: ${program.fees.remaining} by{" "}
                                    {new Date(program.fees.nextDue).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedChild.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <Trophy className="h-6 w-6 text-yellow-600" />
                          <div className="flex-1">
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-sm text-gray-600">
                              {achievement.program} • {new Date(achievement.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Students Management Tab */}
              <TabsContent value="students" className="space-y-6">
                <StudentManagement />
              </TabsContent>

              {/* Programs Tab */}
              <TabsContent value="programs" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">All Programs</h3>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll in New Program
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedChild.programs.map((program) => (
                    <Card key={program.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-semibold">{program.name}</h4>
                            <p className="text-gray-600">{program.school}</p>
                          </div>
                          <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Location</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {program.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Duration</p>
                            <p className="text-sm text-gray-600">
                              {new Date(program.startDate).toLocaleDateString()} -{" "}
                              {new Date(program.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Coach</p>
                            <p className="text-sm text-gray-600">{program.coach}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Level</p>
                            <Badge variant="outline">{program.level}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Schedule</p>
                            <p className="text-sm text-gray-600">{program.schedule}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Fees</p>
                            <p className="text-sm text-gray-600">
                              ${program.fees.paid}/${program.fees.total}
                              {program.fees.remaining > 0 && (
                                <span className="text-red-600 ml-1">(${program.fees.remaining} due)</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {program.status === "Active" && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Modify Enrollment
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedChild.programs.map((program) => (
                        <div key={program.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">{program.name}</h4>
                            <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Overall Progress</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getProgressColor(program.progress)}`}
                                    style={{ width: `${program.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{program.progress}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Attendance Rate</p>
                              <p className="text-lg font-semibold text-green-600">
                                {Math.round((program.attendedSessions / program.totalSessions) * 100)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Sessions Completed</p>
                              <p className="text-lg font-semibold">
                                {program.attendedSessions}/{program.totalSessions}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium mb-2">Skills Development</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-gray-600">Serving</p>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Passing</p>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${star <= 3 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Spiking</p>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${star <= 3 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Defense</p>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Progress Reports & Assessments</h3>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="grid gap-4">
                  {selectedChild.reports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div>
                              <h4 className="font-semibold">{report.title}</h4>
                              <p className="text-sm text-gray-600">
                                {report.type} • {new Date(report.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {report.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Medical Tab */}
              <TabsContent value="medical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" />
                      Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Medical Conditions</h4>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm">
                              <strong>Conditions:</strong> {selectedChild.medicalInfo.conditions}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm">
                              <strong>Medications:</strong> {selectedChild.medicalInfo.medications}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm">
                              <strong>Allergies:</strong> {selectedChild.medicalInfo.allergies}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Emergency Contact</h4>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <strong>Name:</strong> {selectedChild.emergencyContact.name}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              <strong>Phone:</strong> {selectedChild.emergencyContact.phone}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm">
                              <strong>Relationship:</strong> {selectedChild.emergencyContact.relationship}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Last Physical Exam</p>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedChild.medicalInfo.lastPhysical).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Update Medical Info
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Email Test Tab */}
              <TabsContent value="email" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📧 Sistema de Confirmación de Emails
                    </CardTitle>
                    <p className="text-gray-600">
                      Prueba y configura el sistema de envío automático de emails de confirmación de pago.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <EmailTestPanel />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cancellations Tab */}
              <TabsContent value="cancellations" className="space-y-6">
                <CancellationManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
