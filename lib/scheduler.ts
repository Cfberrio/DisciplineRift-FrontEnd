import * as cron from 'node-cron';
import { runSeasonReminders, checkSeasonRemindersConfig } from '../jobs/sendSeasonReminders';
import { startRetryScheduler, stopRetryScheduler, isRetrySchedulerActive } from './retry-scheduler';

/**
 * Configuración del scheduler para jobs automáticos
 */

// Job de recordatorios de temporada - cada día a las 20:30 America/New_York
const SEASON_REMINDERS_SCHEDULE = '30 20 * * *';
const TIMEZONE = 'America/New_York';

let seasonRemindersTask: cron.ScheduledTask | null = null;

/**
 * Inicia el scheduler de recordatorios de temporada
 */
export function startSeasonRemindersScheduler(): boolean {
  try {
    // Verificar que no esté ya iniciado
    if (seasonRemindersTask) {
      console.log('⚠️ Scheduler de recordatorios de temporada ya está activo');
      return true;
    }

    console.log('🚀 Iniciando scheduler de recordatorios de temporada...');
    console.log(`⏰ Programado para ejecutar diariamente a las 20:30 ${TIMEZONE}`);

    seasonRemindersTask = cron.schedule(
      SEASON_REMINDERS_SCHEDULE,
      async () => {
        try {
          console.log(`\n🎯 === EJECUTANDO JOB PROGRAMADO DE RECORDATORIOS DE TEMPORADA ===`);
          console.log(`⏰ Hora de ejecución: ${new Date().toLocaleString('en-US', { timeZone: TIMEZONE })}`);
          
          // Verificar configuración antes de ejecutar
          const configValid = await checkSeasonRemindersConfig();
          if (!configValid) {
            console.error('❌ Configuración inválida, saltando ejecución');
            return;
          }

          await runSeasonReminders();
          console.log('✅ Job programado completado exitosamente\n');
        } catch (error) {
          console.error('💥 Error en job programado de recordatorios de temporada:', error);
        }
      },
      {
        scheduled: true,
        timezone: TIMEZONE
      }
    );

    console.log('✅ Scheduler de recordatorios de temporada iniciado exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error iniciando scheduler de recordatorios de temporada:', error);
    return false;
  }
}

/**
 * Detiene el scheduler de recordatorios de temporada
 */
export function stopSeasonRemindersScheduler(): boolean {
  try {
    if (seasonRemindersTask) {
      seasonRemindersTask.stop();
      seasonRemindersTask.destroy();
      seasonRemindersTask = null;
      console.log('🛑 Scheduler de recordatorios de temporada detenido');
      return true;
    } else {
      console.log('ℹ️ Scheduler de recordatorios de temporada no estaba activo');
      return true;
    }
  } catch (error) {
    console.error('❌ Error deteniendo scheduler de recordatorios de temporada:', error);
    return false;
  }
}

/**
 * Verifica si el scheduler está activo
 */
export function isSeasonRemindersSchedulerActive(): boolean {
  return seasonRemindersTask !== null && seasonRemindersTask.getStatus() === 'scheduled';
}

/**
 * Obtiene información del estado del scheduler
 */
export function getSeasonRemindersSchedulerInfo() {
  return {
    isActive: isSeasonRemindersSchedulerActive(),
    schedule: SEASON_REMINDERS_SCHEDULE,
    timezone: TIMEZONE,
    nextExecution: seasonRemindersTask ? 'Calculando...' : 'No programado'
  };
}

/**
 * Inicia todos los schedulers del sistema
 */
export function startAllSchedulers(): boolean {
  console.log('🚀 === INICIANDO TODOS LOS SCHEDULERS ===');
  
  const seasonRemindersStarted = startSeasonRemindersScheduler();
  const retrySchedulerStarted = startRetryScheduler();
  
  const allStarted = seasonRemindersStarted && retrySchedulerStarted;
  
  if (allStarted) {
    console.log('✅ Todos los schedulers iniciados exitosamente');
  } else {
    console.log('⚠️ Algunos schedulers fallaron al iniciar');
  }
  
  return allStarted;
}

/**
 * Detiene todos los schedulers del sistema
 */
export function stopAllSchedulers(): boolean {
  console.log('🛑 === DETENIENDO TODOS LOS SCHEDULERS ===');
  
  const seasonRemindersStopped = stopSeasonRemindersScheduler();
  const retrySchedulerStopped = stopRetryScheduler();
  
  const allStopped = seasonRemindersStopped && retrySchedulerStopped;
  
  if (allStopped) {
    console.log('✅ Todos los schedulers detenidos exitosamente');
  } else {
    console.log('⚠️ Algunos schedulers fallaron al detenerse');
  }
  
  return allStopped;
}
