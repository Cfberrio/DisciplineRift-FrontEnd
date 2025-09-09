#!/usr/bin/env node

// Script para generar un ejemplo real del correo de confirmación
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Función para formatear fecha
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York'
  });
}

// Función para formatear tiempo en inglés
function formatTimeES(timeString) {
  try {
    const [startTime, endTime] = timeString.split(' - ');
    
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const min = minutes || '00';
      
      if (hour === 0) return `12:${min} AM`;
      if (hour < 12) return `${hour}:${min} AM`;
      if (hour === 12) return `12:${min} PM`;
      return `${hour - 12}:${min} PM`;
    };

    return `${formatTime(startTime)} – ${formatTime(endTime)}`;
  } catch (error) {
    return timeString;
  }
}

// Función para calcular practice occurrences simplificada
function buildSimplePracticeOccurrences(session) {
  const occurrences = [];
  const startDate = new Date(session.startdate);
  const endDate = new Date(session.enddate);
  
  // Simular algunas sesiones para el ejemplo
  const daysOfWeek = session.daysofweek ? session.daysofweek.split(',') : ['Monday', 'Wednesday', 'Friday'];
  
  let currentDate = new Date(startDate);
  currentDate.setHours(12, 0, 0, 0);
  
  let count = 0;
  while (currentDate <= endDate && count < 6) { // Máximo 6 sesiones para el ejemplo
    const dayOfWeek = currentDate.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    
    if (daysOfWeek.includes(dayName)) {
      const formattedDateES = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "America/New_York"
      }).format(currentDate);
      
      const timeFormatted = formatTimeES(`${session.starttime} - ${session.endtime}`);
      
      occurrences.push({
        formattedDateES,
        timeFormatted,
        location: 'School Gymnasium'
      });
      count++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return occurrences;
}

async function getRegisteredStudentData() {
  try {
    console.log('🔍 Buscando estudiantes registrados...');
    
    // Buscar enrollment activo con datos completos
    const { data: enrollments, error } = await supabase
      .from('enrollment')
      .select(`
        enrollmentid,
        student:studentid (
          studentid,
          firstname,
          lastname,
          grade,
          ecname,
          ecphone,
          ecrelationship,
          parent:parentid (
            firstname,
            lastname,
            email
          )
        ),
        team:teamid (
          teamid,
          name,
          description,
          price,
          school:schoolid (
            name,
            location
          ),
          session (
            startdate,
            enddate,
            starttime,
            endtime,
            daysofweek,
            staff:coachid (
              name,
              email,
              phone
            )
          )
        )
      `)
      .eq('isactive', true)
      .limit(1);

    if (error) {
      console.error('❌ Error fetching enrollments:', error);
      return null;
    }

    if (!enrollments || enrollments.length === 0) {
      console.log('❌ No se encontraron estudiantes registrados activos');
      return null;
    }

    const enrollment = enrollments[0];
    console.log('✅ Estudiante encontrado:', enrollment.student?.firstname, enrollment.student?.lastname);
    
    return enrollment;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

function generateEmailHTML(enrollment) {
  const student = enrollment.student;
  const parent = student.parent;
  const team = enrollment.team;
  const school = team.school;
  const session = team.session[0]; // Tomar la primera sesión
  
  // Generar practice occurrences
  const practiceOccurrences = buildSimplePracticeOccurrences(session);
  
  const studentData = {
    firstName: student.firstname,
    lastName: student.lastname,
    grade: student.grade,
    emergencyContact: {
      name: student.ecname,
      phone: student.ecphone,
      relationship: student.ecrelationship
    }
  };
  
  const teamData = {
    name: team.name,
    description: team.description,
    price: team.price,
    school: {
      name: school.name,
      location: school.location
    },
    practiceOccurrences
  };
  
  const paymentData = {
    amount: team.price,
    date: new Date().toISOString(),
    sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9)
  };
  
  const parentData = {
    firstName: parent.firstname,
    lastName: parent.lastname,
    email: parent.email
  };

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
          
          <!-- Practice Schedule - Individual Sessions -->
          ${teamData.practiceOccurrences && teamData.practiceOccurrences.length > 0 ? `
            <div class="section">
              <h3><span class="section-icon">📅</span>Practice Schedule</h3>
              <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${teamData.practiceOccurrences.map((occurrence, index) => `
                    <li style="padding: 12px 0; border-bottom: ${index < teamData.practiceOccurrences.length - 1 ? '1px solid #f3f4f6' : 'none'}; display: flex; justify-content: space-between; align-items: center;">
                      <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1e40af; font-size: 14px; margin-bottom: 2px;">
                          ${occurrence.formattedDateES}
                        </div>
                        <div style="color: #6b7280; font-size: 13px;">
                          ${occurrence.timeFormatted}
                        </div>
                      </div>
                      <div style="text-align: right; color: #9ca3af; font-size: 12px;">
                        ${occurrence.location}
                      </div>
                    </li>
                  `).join('')}
                </ul>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #6b7280; text-align: center;">
                  <strong>Coach:</strong> ${session.staff?.name || 'TBD'} | 
                  <strong>Location:</strong> ${teamData.school.location}
                  <br>
                  <span style="opacity: 0.8;">Schedule shown in Miami timezone (EST/EDT)</span>
                </div>
              </div>
            </div>
          ` : ''}
          
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <h4>Discipline Rift</h4>
          <div class="contact-info">
            <p>📧 Support: info@disciplinerift.com</p>
            <p>📞 Phone: (407) 6147454</p>
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
  `;
}

async function main() {
  console.log('🚀 Generando ejemplo de correo de confirmación...');
  
  const enrollmentData = await getRegisteredStudentData();
  
  if (!enrollmentData) {
    console.log('❌ No se pudo obtener datos de estudiante registrado');
    return;
  }
  
  const htmlContent = generateEmailHTML(enrollmentData);
  
  // Guardar el HTML
  fs.writeFileSync('email-confirmation-example.html', htmlContent);
  console.log('✅ Archivo generado: email-confirmation-example.html');
  
  // Mostrar resumen de datos
  console.log('\n📊 Datos utilizados:');
  console.log(`Estudiante: ${enrollmentData.student.firstname} ${enrollmentData.student.lastname}`);
  console.log(`Padre: ${enrollmentData.student.parent.firstname} ${enrollmentData.student.parent.lastname}`);
  console.log(`Email: ${enrollmentData.student.parent.email}`);
  console.log(`Equipo: ${enrollmentData.team.name}`);
  console.log(`Escuela: ${enrollmentData.team.school.name}`);
  console.log(`Precio: $${enrollmentData.team.price}`);
}

main().catch(console.error);



















