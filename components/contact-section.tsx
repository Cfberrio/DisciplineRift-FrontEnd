"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, User, Mail, Calendar, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"
import { supabase } from "@/lib/supabase"

export default function ContactSection() {
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

  const sendConfirmationEmail = async (firstName: string, email: string) => {
    try {
      console.log('Attempting to send confirmation email to:', email)
      
      const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Discipline Rift</title>
  <style>
    :root {
      --bg: #eef2f7;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #6b7280;
      --border: #e5e7eb;
      --accent1: #6366f1; /* indigo-500 */
      --accent2: #22d3ee; /* cyan-400 */
      --accent3: #06b6d4; /* cyan-500 */
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0b1020;
        --card: #0f172a;
        --text: #e5e7eb;
        --muted: #94a3b8;
        --border: #1f2937;
        --accent1: #818cf8;
        --accent2: #22d3ee;
        --accent3: #38bdf8;
      }
    }

    html, body { height: 100%; }
    body {
      margin: 0; padding: 24px; background: radial-gradient(1200px 600px at 10% 10%, rgba(99,102,241,.08), transparent),
                                     radial-gradient(900px 500px at 90% 20%, rgba(34,211,238,.08), transparent),
                                     var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
      display: grid; place-items: center; min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;
    }

    .wrapper {
      width: 100%; max-width: 640px; background: var(--card);
      border-radius: 16px; padding: 32px; box-sizing: border-box;
      border: 1px solid var(--border);
      box-shadow: 0 10px 20px rgba(0,0,0,.08), 0 6px 12px rgba(0,0,0,.04);
      position: relative; overflow: hidden;
    }

    /* Accent gradient bar */
    .wrapper::before {
      content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px;
      background: linear-gradient(90deg, var(--accent1), var(--accent2), var(--accent3));
    }

    h1 { margin: 0 0 14px; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.01em; }
    p { margin: 0 0 14px; font-size: 16px; line-height: 1.75; }
    .signature { margin-top: 18px; }
    .email { white-space: nowrap; color: var(--muted); }

    @media (max-width: 620px) {
      body { padding: 16px; }
      .wrapper { padding: 22px; border-radius: 14px; }
      h1 { font-size: 24px; }
      p { font-size: 15.5px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <h1>Hi ${firstName},</h1>
    <p>Thanks for applying to be a coach at Discipline Rift!</p>
    <p>Our mission is to help young players grow through humility, perseverance, and adaptability—and we're excited you want to be part of that journey.</p>
    <p>We'll review your application and reach out soon if it's a fit.</p>
    <p>Until then, learn more about our coaching culture through our social media channels.</p>
    <div class="signature">
      <p>– The DR Team</p>
      <p class="email">info@disciplinerift.com</p>
    </div>
  </div>
</body>
</html>`

      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Thank you for applying to Discipline Rift!',
          htmlContent: emailTemplate
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers.get('content-type'))

      // Verificar si la respuesta es HTML (error de Next.js)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
        const htmlError = await response.text()
        console.error('Received HTML response instead of JSON:', htmlError.substring(0, 200))
        throw new Error('Error del servidor: El servicio de correo electrónico no está disponible temporalmente')
      }

      // Intentar parsear como JSON
      let responseData
      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        
        // Intentar obtener el texto de respuesta para más información
        try {
          const textResponse = await response.text()
          console.error('Raw response:', textResponse.substring(0, 200))
        } catch (textError) {
          console.error('Could not read response text:', textError)
        }
        
        throw new Error('Error de comunicación con el servidor de correo electrónico')
      }

      if (!response.ok) {
        const errorMessage = responseData.message || 'Error desconocido del servidor de correo'
        console.error('Email API error:', errorMessage)
        throw new Error(`Error al enviar correo: ${errorMessage}`)
      }

      console.log('Confirmation email sent successfully to:', email)
      return { success: true, messageId: responseData.messageId }
      
    } catch (error) {
      console.error('Error sending confirmation email:', error)
      
      // Proporcionar feedback más detallado al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      // Mostrar una advertencia no bloqueante al usuario
      console.warn('⚠️ Email de confirmación no enviado:', errorMessage)
      
      // Retornar información del error para manejo opcional
              return { 
          success: false, 
          error: errorMessage,
          userMessage: 'Your application was saved successfully, but we could not send the confirmation email. We will contact you soon.'
        }
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
      
      // Crear FormData para envío multipart
      const submitFormData = new FormData()
      
      // Agregar campos de texto
      submitFormData.append('firstName', formData.firstName.trim())
      submitFormData.append('lastName', formData.lastName.trim())
      submitFormData.append('email', formData.email.trim())
      submitFormData.append('number', formData.number.trim())
      submitFormData.append('currentAddre', formData.currentAddress.trim()) // Mantener typo como en BD
      submitFormData.append('sport', formData.sport)
      submitFormData.append('description', formData.description.trim())
      
      // Agregar archivo PDF
      submitFormData.append('resume', resumeFile)
      
      console.log('📤 Submitting to /api/apply endpoint...')
      
      // Enviar a nuevo endpoint
      const response = await fetch('/api/apply', {
        method: 'POST',
        body: submitFormData
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application')
      }
      
      if (!result.ok) {
        throw new Error(result.error || 'Application submission failed')
      }
      
      console.log('✅ Application submitted successfully:', result)
      
      // Send confirmation email after successful submission
      const emailResult = await sendConfirmationEmail(formData.firstName.trim(), formData.email.trim())
      
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
      
      // Personalizar mensaje según el resultado del email
      if (emailResult.success) {
        setSubmitMessage("Thank you for your application! We'll review your submission and get back to you soon. A confirmation email has been sent to your email address.")
      } else {
        setSubmitMessage(`Thank you for your application! We'll review your submission and get back to you soon. ${emailResult.userMessage || 'We will contact you by email.'}`)
      }
      
      // Clear success message after 10 seconds
      setTimeout(() => setSubmitMessage(""), 10000)

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
      className="py-20 bg-cover bg-center relative"
      id="contact"
      style={{ backgroundImage: "url('/contact-us-background.png')" }}
    >
      {/* Optional: Add a subtle overlay if needed for text readability */}
      {/* <div className="absolute inset-0 bg-black/5 z-0"></div> */}

      <div className="container px-4 relative z-10">
        <AnimatedSection animation="fade-down" className="text-center">
          <h2
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-600 mb-4 xs:mb-8 sm:mb-12 md:mb-16 font-bold px-4 xs:px-0"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,255,0.8)" }}
          >
            CONTACT US
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-12">
          {/* Contact Information */}
          <AnimatedSection
            animation="fade-right"
            className="space-y-4 xs:space-y-6 sm:space-y-8 bg-white/70 backdrop-blur-md p-3 xs:p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg"
          >
            <div>
              <h3 className="text-lg xs:text-xl sm:text-2xl ethnocentric-title-blue mb-3 xs:mb-4 sm:mb-6">Get In Touch</h3>
             
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Our Location</h4>
                  <p className="text-gray-700">713 W YALE ST ORLANDO, FL, 32804</p>
                </div>
              </div>

              <div className="flex items-start">
                <User className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Phone Number</h4>
                  <p className="text-gray-700"> (407) 614-7454</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Email Address</h4>
                  <p className="text-gray-700">info@disciplinerift.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Office Hours</h4>
                  <p className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM</p>
          
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <p className="text-gray-800 font-medium">Stay connected with your players and see highlights</p>
                <p className="text-dr-blue font-bold mt-2">🎯 Be part of the Rift. Be part of the movement.</p>
              </div>
              
              <div className="flex justify-center items-center space-x-6">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/disciplinerift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-dr-blue transition-colors">@disciplinerift</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@disciplinerift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-dr-blue transition-colors">@disciplinerift</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/disciplinerift/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-dr-blue transition-colors">@disciplinerift</span>
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Team Application Form */}
          <AnimatedSection animation="fade-left">
            <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-xl">
              <h3 className="text-lg sm:text-xl md:text-2xl ethnocentric-title-blue mb-6 sm:mb-8 text-center">Application Form</h3>
              
              <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
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
                      <Mail className="inline h-4 w-4 mr-2" />
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
                    <Calendar className="inline h-4 w-4 mr-2" />
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
                    <User className="inline h-4 w-4 mr-2" />
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
