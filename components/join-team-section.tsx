"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Loader2, CheckCircle, AlertCircle, User, Mail, Phone, MapPin, FileText, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"
import { supabase } from "@/lib/supabase"

export default function JoinTeamSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    currentAddress: "",
    sport: "",
    description: "",
  })

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear any previous messages when user starts typing
    if (submitMessage) setSubmitMessage("")
    if (submitError) setSubmitError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setSubmitError("Please upload a PDF, DOC, or DOCX file.")
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("File size must be less than 5MB.")
        return
      }
      
      setResumeFile(file)
      setSubmitError("")
    }
  }

  const uploadResume = async (file: File): Promise<string> => {
    setUploadProgress(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Upload failed')
      }

      return result.fileUrl
    } catch (error) {
      console.error('Resume upload error:', error)
      throw error
    } finally {
      setUploadProgress(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSubmitMessage("")
    setSubmitError("")

    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'number', 'currentAddress', 'sport', 'description']
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData].trim()) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required.`)
        }
      }

      if (!resumeFile) {
        throw new Error("Please upload your resume.")
      }

      console.log("Submitting team application:", formData)
      
      // Store resume info and convert to base64 if small enough
      console.log('Processing resume file:', resumeFile.name, 'Size:', resumeFile.size)
      
      let resumeUrl = ""
      
      if (resumeFile.size <= 1024 * 1024) { // 1MB o menos, convertir a base64
        try {
          console.log('Converting to base64 (file <= 1MB)...')
          const arrayBuffer = await resumeFile.arrayBuffer()
          const buffer = new Uint8Array(arrayBuffer)
          const base64 = btoa(String.fromCharCode(...buffer))
          const base64WithMime = `data:${resumeFile.type};base64,${base64}`
          
          resumeUrl = base64WithMime
          console.log('✅ File converted to base64, length:', base64.length)
        } catch (conversionError) {
          console.error('❌ Base64 conversion failed:', conversionError)
          resumeUrl = `large_file_${resumeFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}_${Date.now()}`
        }
      } else {
        // Archivo muy grande, solo guardar referencia
        console.log('File too large for base64, storing reference only')
        resumeUrl = `large_file_${resumeFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}_${Date.now()}_${resumeFile.size}bytes`
      }

      // Submit to Supabase database directly with error handling
      console.log("Submitting to Supabase database...")
      
      const applicationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        number: formData.number.trim(),
        currentAddre: formData.currentAddress.trim(),
        sport: formData.sport,
        description: formData.description.trim(),
        resume: resumeUrl
      }

      // Try to insert into Drteam table (capital D)
      const { data, error } = await supabase
        .from('Drteam')
        .insert([applicationData])
        .select()

      if (error) {
        console.error('Database insertion error:', error)
        
        // If table doesn't exist, save to a generic table or handle gracefully
        if (error.message && (error.message.includes('relation') || error.message.includes('does not exist'))) {
          console.warn('Drteam table not found, using alternative storage method')
          
          // Try to save to a contact table or create a simple log
          try {
            const fallbackData = {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email.trim(),
              subject: `Team Application - ${formData.sport}`,
              message: `Application for ${formData.sport} coaching position.\n\nAddress: ${formData.currentAddress}\nPhone: ${formData.number}\n\nDescription: ${formData.description}\n\nResume: ${resumeUrl}`
            }
            
            // Try contact table as fallback
            const { data: fallbackResult, error: fallbackError } = await supabase
              .from('contact')
              .insert([fallbackData])
              .select()
              
            if (fallbackError) {
              console.error('Fallback insertion also failed:', fallbackError)
              throw new Error('Database configuration issue. Please contact support with your application details.')
            }
            
            console.log('Application saved to contact table as fallback')
          } catch (fallbackErr) {
            throw new Error('Unable to save application. Please try again or contact support.')
          }
        } else {
          throw new Error(`Database error: ${error.message}`)
        }
      }

      console.log('Application submitted successfully:', data)

      console.log("Team application submitted successfully")
      
      // Reset form on success
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        number: "",
        currentAddress: "",
        sport: "",
        description: "",
      })
      setResumeFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('resume') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      setSubmitMessage("Thank you for your application! We'll review your submission and get back to you soon.")
      
      // Clear success message after 8 seconds
      setTimeout(() => setSubmitMessage(""), 8000)

    } catch (error) {
      console.error("Team application submission error:", error)
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "An error occurred while submitting your application. Please try again."
      )
      
      // Clear error message after 8 seconds
      setTimeout(() => setSubmitError(""), 8000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="py-12 sm:py-16 md:py-20 bg-cover bg-center relative"
      id="join-team"
      style={{ backgroundImage: "url('/contact-us-background.png')" }}
    >
      {/* Optional: Add a subtle overlay if needed for text readability */}
      {/* <div className="absolute inset-0 bg-black/5 z-0"></div> */}

      <div className="container px-4 relative z-10">
        <AnimatedSection animation="fade-down" className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2
            className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-blue-600 mb-4 sm:mb-6 md:mb-8 font-bold px-4 xs:px-0"
            style={{ 
              fontFamily: 'Ethnocentric, sans-serif',
              textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,255,0.8)" 
            }}
          >
            JOIN OUR DR TEAM
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 px-4 sm:px-6 md:px-8 leading-relaxed bg-white/70 backdrop-blur-sm rounded-lg p-4 sm:p-6 md:p-8 shadow-lg">
              We're always building a team of passionate coaches to bring energy and skill to every practice. Make a real impact on the next generation of athletes! More than coaching; it's leadership and transformation through sports.
            </p>
          </div>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-xl">
              <h3 className="text-lg sm:text-xl md:text-2xl ethnocentric-title-blue mb-6 sm:mb-8 text-center">Application Form</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields - Mobile: stacked, Tablet+: side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 min-h-[44px]"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 min-h-[44px]"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email and Phone - Mobile: stacked, Tablet+: side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 min-h-[44px]"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="number" className="block text-gray-700 font-medium mb-2">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      required
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 min-h-[44px]"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Address - Full width */}
                <div>
                  <label htmlFor="currentAddress" className="block text-gray-700 font-medium mb-2">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Current Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="currentAddress"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleChange}
                    required
                    className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 min-h-[44px]"
                    placeholder="Enter your full address"
                  />
                </div>

                {/* Sport Selection */}
                <div>
                  <label htmlFor="sport" className="block text-gray-700 font-medium mb-2">
                    <Target className="inline h-4 w-4 mr-2" />
                    Sport of Interest <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sport"
                    name="sport"
                    value={formData.sport}
                    onChange={handleChange}
                    required
                    className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 min-h-[44px]"
                  >
                    <option value="">Select a sport</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Pickleball">Pickleball</option>
                  </select>
                </div>

                {/* Resume Upload */}
                <div>
                  <label htmlFor="resume" className="block text-gray-700 font-medium mb-2">
                    <FileText className="inline h-4 w-4 mr-2" />
                    Upload Resume <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      required
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 min-h-[44px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dr-blue file:text-white hover:file:bg-blue-600"
                    />
                    {uploadProgress && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin text-dr-blue" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                  {resumeFile && (
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      File selected: {resumeFile.name}
                    </p>
                  )}
                </div>

                {/* Inspiration Textarea */}
                <div>
                  <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                    What inspires you to become a coach? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 resize-none"
                    placeholder="Tell us what motivates you to coach and make a difference in young athletes' lives..."
                  ></textarea>
                </div>

                {/* Success/Error Messages */}
                {submitMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">{submitMessage}</span>
                  </div>
                )}
                
                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">{submitError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || uploadProgress}
                  className="w-full bg-dr-blue hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg py-3 md:py-4 shadow-md transition-all duration-200 min-h-[44px] text-base md:text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : uploadProgress ? (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Uploading Resume...
                    </>
                  ) : (
                    "APPLY NOW"
                  )}
                </Button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}