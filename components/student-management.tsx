"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Plus, Edit, Trash2, Calendar, Phone, CheckCircle, AlertCircle, Loader2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Student {
  id: string
  firstName: string
  lastName: string
  fullName: string
  dateOfBirth: string
  grade: string
  age: number
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  enrollments?: Array<{
    id: string
    isActive: boolean
    team: {
      id: string
      name: string
      school: {
        name: string
        location: string
      }
    }
  }>
  createdAt: string
  updatedAt?: string
}

interface StudentFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  grade: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  medicalConditions: string
  specialInstructions: string
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const [formData, setFormData] = useState<StudentFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    grade: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    medicalConditions: "",
    specialInstructions: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Load students on component mount
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/students")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to load students")
      }

      setStudents(data.students || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) errors.firstName = "First name is required"
    if (!formData.lastName.trim()) errors.lastName = "Last name is required"
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required"
    if (!formData.grade) errors.grade = "Grade is required"
    if (!formData.emergencyContactName.trim()) errors.emergencyContactName = "Emergency contact name is required"
    if (!formData.emergencyContactPhone.trim()) errors.emergencyContactPhone = "Emergency contact phone is required"
    if (!formData.emergencyContactRelation)
      errors.emergencyContactRelation = "Emergency contact relationship is required"

    // Validate phone number
    if (formData.emergencyContactPhone && !/^\d{10}$/.test(formData.emergencyContactPhone.replace(/\D/g, ""))) {
      errors.emergencyContactPhone = "Please enter a valid 10-digit phone number"
    }

    // Validate date of birth
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()

      if (dob >= today) {
        errors.dateOfBirth = "Date of birth must be in the past"
      } else if (age < 5 || age > 18) {
        errors.dateOfBirth = "Child must be between 5 and 18 years old"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students"
      const method = editingStudent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingStudent ? "update" : "create"} student`)
      }

      setSuccess(data.message)
      setShowForm(false)
      setEditingStudent(null)
      resetForm()
      await loadStudents() // Reload the students list
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      grade: student.grade,
      emergencyContactName: student.emergencyContact.name,
      emergencyContactPhone: student.emergencyContact.phone.replace(/\D/g, ""),
      emergencyContactRelation: student.emergencyContact.relationship,
      medicalConditions: "",
      specialInstructions: "",
    })
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.fullName}'s record? This action cannot be undone.`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete student")
      }

      setSuccess(data.message)
      await loadStudents() // Reload the students list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student")
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      grade: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      medicalConditions: "",
      specialInstructions: "",
    })
    setFormErrors({})
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingStudent(null)
    resetForm()
    setError(null)
    setSuccess(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading students...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
          <p className="text-gray-600 mt-2">Manage your children's information and registrations</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingStudent(null)
            resetForm()
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Child
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingStudent ? `Edit ${editingStudent.fullName}` : "Add New Child"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={cn(formErrors.firstName && "border-red-500")}
                    required
                  />
                  {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={cn(formErrors.lastName && "border-red-500")}
                    required
                  />
                  {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={cn(formErrors.dateOfBirth && "border-red-500")}
                    required
                  />
                  {formErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
                </div>

                <div>
                  <label htmlFor="grade" className="block text-gray-700 mb-1">
                    Current Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      formErrors.grade && "border-red-500",
                    )}
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="6">6th Grade</option>
                    <option value="7">7th Grade</option>
                    <option value="8">8th Grade</option>
                    <option value="9">9th Grade</option>
                    <option value="10">10th Grade</option>
                    <option value="11">11th Grade</option>
                    <option value="12">12th Grade</option>
                  </select>
                  {formErrors.grade && <p className="text-red-500 text-sm mt-1">{formErrors.grade}</p>}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className={cn(formErrors.emergencyContactName && "border-red-500")}
                    required
                  />
                  {formErrors.emergencyContactName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.emergencyContactName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className={cn(formErrors.emergencyContactPhone && "border-red-500")}
                    required
                  />
                  {formErrors.emergencyContactPhone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.emergencyContactPhone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="emergencyContactRelation" className="block text-gray-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="emergencyContactRelation"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      formErrors.emergencyContactRelation && "border-red-500",
                    )}
                    required
                  >
                    <option value="">Select Relationship</option>
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Aunt/Uncle">Aunt/Uncle</option>
                    <option value="Family Friend">Family Friend</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.emergencyContactRelation && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.emergencyContactRelation}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="medicalConditions" className="block text-gray-700 mb-1">
                    Medical Conditions or Allergies
                  </label>
                  <textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Please list any medical conditions, allergies, or medications..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="specialInstructions" className="block text-gray-700 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any special instructions or information about your child..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" onClick={cancelForm} variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingStudent ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingStudent ? "Update Child" : "Add Child"}</>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      <div className="space-y-6">
        {students.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Added Yet</h3>
            <p className="text-gray-600 mb-6">Add your first child to get started with registrations.</p>
            <Button
              onClick={() => {
                setShowForm(true)
                setEditingStudent(null)
                resetForm()
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Child
            </Button>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <User className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{student.fullName}</h3>
                      <p className="text-gray-600">
                        Age {student.age} • Grade {student.grade}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Born: {new Date(student.dateOfBirth).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Emergency Contact</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {student.emergencyContact.name} ({student.emergencyContact.relationship})
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {student.emergencyContact.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {student.enrollments && student.enrollments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-gray-900 mb-2">Current Enrollments</h4>
                      <div className="space-y-2">
                        {student.enrollments
                          .filter((e) => e.isActive)
                          .map((enrollment) => (
                            <div key={enrollment.id} className="bg-blue-50 p-3 rounded-lg">
                              <p className="font-medium text-blue-900">{enrollment.team.name}</p>
                              <p className="text-sm text-blue-700">
                                {enrollment.team.school.name} - {enrollment.team.school.location}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    onClick={() => handleEdit(student)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(student)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
