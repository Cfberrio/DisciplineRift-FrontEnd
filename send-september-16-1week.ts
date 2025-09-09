// Cargar variables de entorno
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { runSeasonReminders } from './jobs/sendSeasonReminders';
import { DateTime } from 'luxon';

async function sendReminders() {
  try {
    console.log('🚀 Enviando recordatorios de 1 semana para Tuesday, September 16, 2025...');
    
    // Simular que estamos 7 días antes del 16 de septiembre (9 de septiembre)
    const simulatedDate = DateTime.fromISO('2025-09-09', { zone: 'America/New_York' }).toJSDate();
    
    console.log(`📅 Simulando fecha actual: ${DateTime.fromJSDate(simulatedDate).toISODate()}`);
    console.log(`🎯 Enviando recordatorios para sesiones que inician: 2025-09-16`);
    
    // Ejecutar el job con la fecha simulada
    await runSeasonReminders({ now: simulatedDate });
    
    console.log('✅ Recordatorios enviados exitosamente');
    
  } catch (error) {
    console.error('❌ Error enviando recordatorios:', error);
    process.exit(1);
  }
}

sendReminders();
