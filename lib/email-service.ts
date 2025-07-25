import nodemailer from 'nodemailer'

// Configurar el transportador de Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// Tipos para los datos del email
interface StudentData {
  firstName: string
  lastName: string
  grade: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

interface TeamData {
  teamid: string
  name: string
  description: string
  price: number
  created_at: string
  updated_at: string
  school: {
    name: string
    location: string
  }
  session?: Array<{
    startdate: string
    enddate: string
    starttime: string
    endtime: string
    daysofweek: string
    staff?: {
      name: string
      email: string
      phone: string
    }
  }>
}

interface PaymentData {
  amount: number
  date: string
  sessionId: string
}

interface ParentData {
  firstName: string
  lastName: string
  email: string
}

// HTML Template for payment confirmation email
const createEmailTemplate = (
  studentData: StudentData,
  teamData: TeamData,
  paymentData: PaymentData,
  parentData: ParentData
) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Confirmation - Discipline Rift</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8fafc;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .success-icon {
          width: 80px;
          height: 80px;
          background-color: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 40px;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .section {
          margin-bottom: 30px;
          padding: 25px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          background-color: #f8fafc;
        }
        
        .section h3 {
          color: #1e40af;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        
        .section-icon {
          margin-right: 10px;
          font-size: 20px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        
        .info-item {
          padding: 12px;
          background-color: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        
        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }
        
        .amount-highlight {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        
        .amount-highlight .amount {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        

        
        .footer {
          background-color: #1f2937;
          color: #9ca3af;
          padding: 30px;
          text-align: center;
        }
        
        .footer h4 {
          color: white;
          margin-bottom: 15px;
        }
        
        .contact-info {
          margin: 20px 0;
        }
        
        .contact-info p {
          margin: 5px 0;
        }
        
        @media (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 8px;
          }
          
          .header, .content, .footer {
            padding: 20px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .amount-highlight .amount {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>Registration Successful!</h1>
          <p>Your payment has been processed successfully</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Payment Confirmation -->
          <div class="amount-highlight">
            <div class="amount">${formatCurrency(paymentData.amount)}</div>
            <div>Payment confirmed on ${formatDate(paymentData.date)}</div>
          </div>
          
          <!-- Student Information -->
          <div class="section">
            <h3><span class="section-icon">👨‍🎓</span>Student Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${studentData.firstName} ${studentData.lastName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Grade</div>
                <div class="info-value">${studentData.grade}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Emergency Contact</div>
                <div class="info-value">${studentData.emergencyContact.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Emergency Phone</div>
                <div class="info-value">${studentData.emergencyContact.phone}</div>
              </div>
            </div>
          </div>
          
          <!-- Team Information -->
          <div class="section">
            <h3><span class="section-icon">🏐</span>Team Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Team Name</div>
                <div class="info-value">${teamData.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">School</div>
                <div class="info-value">${teamData.school.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Location</div>
                <div class="info-value">${teamData.school.location}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Price</div>
                <div class="info-value">${formatCurrency(teamData.price)}</div>
              </div>
            </div>
            
            ${teamData.description ? `
              <div style="margin-top: 15px; padding: 15px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                <div class="info-label">Description</div>
                <div class="info-value">${teamData.description}</div>
              </div>
            ` : ''}
          </div>
          
          <!-- Schedule Information -->
          ${teamData.session && teamData.session.length > 0 ? `
            <div class="section">
              <h3><span class="section-icon">📅</span>Training Schedule</h3>
              ${teamData.session.map(session => `
                <div class="info-grid" style="margin-bottom: 15px;">
                  <div class="info-item">
                    <div class="info-label">Dates</div>
                    <div class="info-value">${formatDate(session.startdate)} - ${formatDate(session.enddate)}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Time</div>
                    <div class="info-value">${session.starttime} - ${session.endtime}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Days</div>
                    <div class="info-value">${session.daysofweek}</div>
                  </div>
                  ${session.staff ? `
                    <div class="info-item">
                      <div class="info-label">Coach</div>
                      <div class="info-value">${session.staff.name}</div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

        </div>
        
        <!-- Footer -->
        <div class="footer">
          <h4>Discipline Rift</h4>
          <div class="contact-info">
            <p>📧 Support: info@disciplinerift.com</p>
            <p>📞 Phone: (555) 123-4567</p>
            <p>🌐 Web: www.disciplinerift.com</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
            <p style="font-size: 12px;">
              This is an automated email. If you have any questions, please don't hesitate to contact us.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Función principal para enviar el correo de confirmación
export async function sendPaymentConfirmationEmail(
  parentEmail: string,
  studentData: StudentData,
  teamData: TeamData,
  paymentData: PaymentData,
  parentData: ParentData
) {
  try {
    // Verificar que las credenciales de Gmail estén configuradas
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured')
    }

    const transporter = createTransporter()

    // Generar el HTML del correo
    const htmlContent = createEmailTemplate(studentData, teamData, paymentData, parentData)

    // Configurar el correo
    const mailOptions = {
      from: {
        name: 'Discipline Rift',
        address: process.env.GMAIL_USER!,
      },
      to: parentEmail,
      subject: `✅ Registration Confirmation - ${studentData.firstName} ${studentData.lastName}`,
      html: htmlContent,
    }

    // Enviar el correo
    const result = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Función para verificar la configuración del email
export async function verifyEmailConfiguration() {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return { configured: false, message: 'Gmail credentials not configured' }
    }

    const transporter = createTransporter()
    await transporter.verify()
    
    return { configured: true, message: 'Email configuration is valid' }
  } catch (error) {
    return { 
      configured: false, 
      message: error instanceof Error ? error.message : 'Unknown configuration error' 
    }
  }
} 

// Template HTML para notificación de pago a la empresa
const createCompanyNotificationTemplate = (
  studentData: StudentData,
  teamData: TeamData,
  paymentData: PaymentData,
  parentData: ParentData
) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Payment Received - Discipline Rift</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8fafc;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
        }
        .amount-highlight {
          background: #f0fdf4;
          border: 2px solid #10b981;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .amount {
          font-size: 36px;
          font-weight: bold;
          color: #059669;
          margin-bottom: 10px;
        }
        .info-section {
          margin: 20px 0;
          padding: 15px;
          background-color: #f8fafc;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
        }
        .info-title {
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-label {
          font-weight: 500;
          color: #6b7280;
        }
        .info-value {
          font-weight: 600;
          color: #1f2937;
        }
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 New Payment Received!</h1>
          <p>A new registration payment has been processed</p>
        </div>
        
        <div class="content">
          <div class="amount-highlight">
            <div class="amount">${formatCurrency(paymentData.amount)}</div>
            <div>Payment received on ${formatDate(paymentData.date)}</div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 10px;">
              Session ID: ${paymentData.sessionId}
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-title">👨‍👩‍👧‍👦 Parent Information</div>
            <div class="info-item">
              <span class="info-label">Name:</span>
              <span class="info-value">${parentData.firstName} ${parentData.lastName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${parentData.email}</span>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-title">👨‍🎓 Student Information</div>
            <div class="info-item">
              <span class="info-label">Name:</span>
              <span class="info-value">${studentData.firstName} ${studentData.lastName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Grade:</span>
              <span class="info-value">${studentData.grade}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Emergency Contact:</span>
              <span class="info-value">${studentData.emergencyContact.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Emergency Phone:</span>
              <span class="info-value">${studentData.emergencyContact.phone}</span>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-title">🏐 Team Information</div>
            <div class="info-item">
              <span class="info-label">Team:</span>
              <span class="info-value">${teamData.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">School:</span>
              <span class="info-value">${teamData.school.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Location:</span>
              <span class="info-value">${teamData.school.location}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Team Price:</span>
              <span class="info-value">${formatCurrency(teamData.price)}</span>
            </div>
          </div>
          
          ${teamData.session && teamData.session.length > 0 ? `
            <div class="info-section">
              <div class="info-title">📅 Schedule Information</div>
              ${teamData.session.map(session => `
                <div style="margin-bottom: 10px; padding: 10px; background-color: white; border-radius: 4px;">
                  <div class="info-item">
                    <span class="info-label">Dates:</span>
                    <span class="info-value">${formatDate(session.startdate)} - ${formatDate(session.enddate)}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Time:</span>
                    <span class="info-value">${session.starttime} - ${session.endtime}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Days:</span>
                    <span class="info-value">${session.daysofweek}</span>
                  </div>
                  ${session.staff ? `
                    <div class="info-item">
                      <span class="info-label">Coach:</span>
                      <span class="info-value">${session.staff.name}</span>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              📊 This is an automated payment notification. Please verify the payment in your Stripe dashboard.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Función para enviar notificación de pago a la empresa
export async function sendPaymentNotificationToCompany(
  studentData: StudentData,
  teamData: TeamData,
  paymentData: PaymentData,
  parentData: ParentData
) {
  try {
    // Verificar que las credenciales de Gmail estén configuradas
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured')
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    }

    const transporter = createTransporter()

    // Generar el HTML del correo
    const htmlContent = createCompanyNotificationTemplate(studentData, teamData, paymentData, parentData)

    // Configurar el correo
    const mailOptions = {
      from: {
        name: 'Discipline Rift Payment System',
        address: process.env.GMAIL_USER!,
      },
      to: 'disciplinerift@gmail.com',
      subject: `💰 New Payment: ${formatCurrency(paymentData.amount)} - ${studentData.firstName} ${studentData.lastName}`,
      html: htmlContent,
    }

    // Enviar el correo
    const result = await transporter.sendMail(mailOptions)
    
    console.log('✅ Company notification email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending company notification email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 