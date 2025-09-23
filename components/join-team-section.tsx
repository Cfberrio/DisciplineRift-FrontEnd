"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { MapPin, User, Mail, Calendar, Loader2, CheckCircle, AlertCircle, Upload, FileText } from "lucide-react"
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
  })
  
  const [resumeFile, setResumeFile] = useState<File | null>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      // Validar tipo de archivo
      if (file.type !== 'application/pdf') {
        setSubmitError("Solo se permiten archivos PDF para el resume.")
        setTimeout(() => setSubmitError(""), 5000)
        return
      }
      
      // Validar tamaño de archivo (10MB máximo)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setSubmitError("El archivo debe ser menor a 10MB.")
        setTimeout(() => setSubmitError(""), 5000)
        return
      }
      
      setResumeFile(file)
      console.log('Resume file selected:', file.name, file.size, 'bytes')
    } else {
      setResumeFile(null)
    }
    
    // Clear any previous messages
    if (submitMessage) setSubmitMessage("")
    if (submitError) setSubmitError("")
  }


  const sendNotificationEmail = async (applicationData: any, hasResume: boolean) => {
    try {
      console.log('Sending notification email to admin...')
      
      const notificationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>🔥 NEW COACH APPLICATION - Discipline Rift</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
    
    :root {
      --bg: #0a0a0f;
      --card: #1a1a2e;
      --text: #ffffff;
      --muted: #a0a9c0;
      --border: #16213e;
      --accent1: #ff6b35;
      --accent2: #00d4ff;
      --accent3: #f7931e;
      --success: #00ff88;
      --warning: #ffd700;
      --danger: #ff3366;
      --glow: 0 0 20px rgba(255, 107, 53, 0.3);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body { height: 100%; }
    body {
      margin: 0; padding: 20px; 
      background: radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 70%);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
    }

    .container {
      max-width: 800px; margin: 0 auto;
      background: var(--card);
      border-radius: 24px;
      border: 2px solid var(--border);
      box-shadow: 0 30px 60px rgba(0,0,0,0.4), var(--glow);
      position: relative;
      overflow: hidden;
    }

    .container::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; height: 8px;
      background: linear-gradient(90deg, var(--accent1), var(--accent2), var(--accent3), var(--success));
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .header {
      text-align: center; padding: 40px 30px 20px;
      background: linear-gradient(135deg, rgba(255,107,53,0.1), rgba(0,212,255,0.1));
      position: relative;
    }

    .urgent-badge {
      display: inline-flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, var(--danger), #ff6b35);
      color: white; padding: 12px 24px; border-radius: 30px;
      font-weight: 700; font-size: 16px; margin-bottom: 20px;
      text-transform: uppercase; letter-spacing: 1px;
      box-shadow: 0 8px 25px rgba(255, 51, 102, 0.4);
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
      60% { transform: translateY(-3px); }
    }

    .title {
      font-family: 'Orbitron', monospace;
      font-size: 48px; font-weight: 900; line-height: 1;
      background: linear-gradient(135deg, var(--accent2), var(--accent1), var(--success));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; margin-bottom: 10px;
      text-shadow: 0 0 30px rgba(0,212,255,0.5);
    }

    .subtitle {
      font-size: 20px; color: var(--accent2); font-weight: 600;
      text-transform: uppercase; letter-spacing: 2px;
    }

    .applicant-name {
      font-size: 28px; font-weight: 700; color: var(--warning);
      margin: 20px 0; text-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    }

    .content {
      padding: 30px;
    }

    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;
    }

    .info-card {
      background: linear-gradient(135deg, var(--bg), rgba(26,26,46,0.8));
      border: 1px solid var(--border);
      border-radius: 16px; padding: 20px;
      position: relative;
      transition: all 0.3s ease;
    }

    .info-card:hover {
      border-color: var(--accent2);
      box-shadow: 0 10px 25px rgba(0,212,255,0.2);
      transform: translateY(-2px);
    }

    .info-label {
      font-size: 11px; font-weight: 700; color: var(--accent2);
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
    }

    .info-value {
      font-size: 16px; font-weight: 600; color: var(--text);
      word-break: break-word;
    }

    .inspiration-section {
      background: linear-gradient(135deg, rgba(255,107,53,0.1), rgba(0,212,255,0.1));
      border: 2px solid var(--accent1);
      border-radius: 20px; padding: 25px; margin: 30px 0;
      position: relative;
    }

    .inspiration-section::before {
      content: "💭";
      position: absolute;
      top: -15px; left: 25px;
      background: var(--card);
      padding: 0 10px;
      font-size: 24px;
    }

    .inspiration-title {
      font-size: 16px; font-weight: 700; color: var(--accent1);
      margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;
    }

    .inspiration-text {
      font-size: 16px; line-height: 1.7; color: var(--text);
      font-style: italic; padding: 15px 0;
      border-left: 4px solid var(--accent2);
      padding-left: 20px;
    }

    .resume-banner {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 20px; border-radius: 15px; font-weight: 700; font-size: 18px;
      margin: 25px 0; text-transform: uppercase; letter-spacing: 1px;
    }

    .resume-yes {
      background: linear-gradient(135deg, var(--success), #00cc6a);
      color: #000; box-shadow: 0 10px 25px rgba(0,255,136,0.3);
    }

    .resume-no {
      background: linear-gradient(135deg, var(--muted), #6b7280);
      color: var(--text);
    }

    .action-section {
      text-align: center; margin: 40px 0 20px;
      padding: 30px; background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(255,107,53,0.1));
      border-radius: 20px; border: 2px solid var(--accent2);
    }

    .action-text {
      font-size: 18px; font-weight: 600; color: var(--accent2);
      margin-bottom: 15px;
    }

    .dashboard-link {
      display: inline-block;
      background: linear-gradient(135deg, var(--accent1), var(--accent2));
      color: white; padding: 15px 30px; border-radius: 25px;
      text-decoration: none; font-weight: 700; font-size: 16px;
      text-transform: uppercase; letter-spacing: 1px;
      box-shadow: 0 8px 25px rgba(255,107,53,0.4);
      transition: all 0.3s ease;
    }

    .footer {
      text-align: center; padding: 30px;
      border-top: 2px solid var(--border);
      background: var(--bg);
    }

    .timestamp {
      font-size: 14px; color: var(--muted); font-family: 'Orbitron', monospace;
      background: var(--card); padding: 12px 20px; border-radius: 10px;
      display: inline-block; border: 1px solid var(--border);
    }

    .pulse-dot {
      display: inline-block;
      width: 8px; height: 8px; background: var(--success);
      border-radius: 50%; margin-right: 8px;
      animation: pulse-dot 2s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    @media (max-width: 600px) {
      body { padding: 10px; }
      .container { border-radius: 16px; }
      .title { font-size: 32px; }
      .info-grid { grid-template-columns: 1fr; gap: 15px; }
      .header, .content { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="urgent-badge">
        🔥 URGENT: NEW APPLICATION
      </div>
      <h1 class="title">DISCIPLINE RIFT</h1>
      <p class="subtitle">Coach Recruitment Alert</p>
      <div class="applicant-name">${applicationData.firstName} ${applicationData.lastName}</div>
    </div>

    <div class="content">
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">📧 Email Address</div>
          <div class="info-value">${applicationData.email}</div>
        </div>
        <div class="info-card">
          <div class="info-label">📱 Phone Number</div>
          <div class="info-value">${applicationData.number}</div>
        </div>
        <div class="info-card">
          <div class="info-label">📍 Location</div>
          <div class="info-value">${applicationData.currentAddress}</div>
        </div>
        <div class="info-card">
          <div class="info-label">⏰ Application Time</div>
          <div class="info-value">${new Date().toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}</div>
        </div>
      </div>

      <div class="inspiration-section">
        <div class="inspiration-title">🎯 Coaching Inspiration</div>
        <p class="inspiration-text">"${applicationData.description}"</p>
      </div>

      <div class="resume-banner ${hasResume ? 'resume-yes' : 'resume-no'}">
        ${hasResume ? '✅ Resume Attached - Ready for Review' : '📋 No Resume Attached'}
      </div>

      <div class="action-section">
        <p class="action-text">
          <span class="pulse-dot"></span>
          New Coach Application Ready for Review
        </p>
        <a href="#" class="dashboard-link">View Full Application</a>
      </div>
    </div>

    <div class="footer">
      <div class="timestamp">
        Application received: ${new Date().toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}
      </div>
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
          to: 'info@disciplinerift.com',
          subject: `🔥 URGENT: New Coach Application - ${applicationData.firstName} ${applicationData.lastName}`,
          htmlContent: notificationTemplate
        })
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        console.error('Notification email failed:', responseData)
        return { success: false, error: responseData.message }
      }

      console.log('✅ Notification email sent successfully to admin')
      return { success: true }
      
    } catch (error) {
      console.error('Error sending notification email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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
      
      // Agregar archivo de resume si existe
      if (resumeFile) {
        submitFormData.append('resume', resumeFile)
        console.log('📎 Resume file added to form data:', resumeFile.name)
      }
      
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
      
      // Send notification email to admin
      const notificationResult = await sendNotificationEmail(formData, !!resumeFile)
      if (!notificationResult.success) {
        console.warn('⚠️ Failed to send notification email to admin:', notificationResult.error)
      }
      
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
      })
      setResumeFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('resume') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      
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

                {/* Resume Upload */}
                <div>
                  <label htmlFor="resume" className="block text-gray-700 font-medium mb-2">
                    <FileText className="inline h-4 w-4 mr-2" />
                    Upload Resume (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dr-blue/10 file:text-dr-blue hover:file:bg-dr-blue/20 cursor-pointer min-h-[44px]"
                    />
                    {resumeFile && (
                      <div className="mt-2 flex items-center text-sm text-gray-600 bg-green-50 p-2 rounded-lg">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        <span>Archivo seleccionado: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Solo archivos PDF. Tamaño máximo: 10MB.
                  </p>
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