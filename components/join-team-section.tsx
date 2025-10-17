"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { MapPin, User, Mail, Calendar, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"

export default function JoinTeamSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    currentAddress: "",
    description: "",
    company: "", // Honeypot field - should remain empty
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear any previous messages when user starts typing
    if (submitMessage) setSubmitMessage("")
    if (submitError) setSubmitError("")
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
      const requiredFields = ['firstName', 'lastName', 'email', 'number', 'currentAddress', 'description']
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData].trim()) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required.`)
        }
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
      submitFormData.append('description', formData.description.trim())
      submitFormData.append('company', formData.company) // Honeypot field
      
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
        description: "",
        company: "",
      })
      
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
      className="py-12 sm:py-16 md:py-20 bg-cover bg-center relative"
      id="join-team"
      style={{ backgroundImage: "url('/contact-us-background.png')" }}
    >
      {/* Optional: Add a subtle overlay if needed for text readability */}
      {/* <div className="absolute inset-0 bg-black/5 z-0"></div> */}

      <div className="container px-4 relative z-10">
        <AnimatedSection animation="fade-down" className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="mb-4 sm:mb-6 md:mb-8 px-4 xs:px-0 flex justify-center">
            <Image
              src="/CONTACTFORM.png"
              alt="Contact Form"
              width={500}
              height={150}
              className="w-auto h-auto max-w-full max-h-20 xs:max-h-24 sm:max-h-28 md:max-h-32 lg:max-h-36"
              style={{ 
                filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) drop-shadow(0 0 15px rgba(255,255,255,0.8))"
              }}
            />
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white px-4 sm:px-6 md:px-8 leading-relaxed bg-white/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 md:p-8 shadow-lg">
            We’re always building a team of passionate coaches to bring energy and skill to every practice. Make a real impact on the next generation of athletes!
            
            </p>
          </div>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="bg-white/30 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-lg">
              <h3 className="text-lg sm:text-xl md:text-2xl ethnocentric-title-white mb-4 sm:mb-6 text-center">JOIN OUR DR TEAM</h3>
              
              
              
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

                {/* Honeypot field - hidden from users, but bots will fill it */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="company">Company (leave blank)</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
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
                  disabled={isSubmitting}
                  className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg py-3 md:py-4 shadow-md transition-all duration-200 min-h-[44px] text-base md:text-lg font-semibold ethnocentric-title-white not-italic"
                  style={{ backgroundColor: '#0085B7' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Application...
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