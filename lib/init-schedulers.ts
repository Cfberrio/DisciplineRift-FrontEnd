/**
 * Archivo de inicialización de schedulers para Discipline Rift
 * 
 * Este archivo debe ser importado en el punto de entrada de la aplicación
 * para iniciar automáticamente todos los jobs programados.
 */

import { startAllSchedulers, stopAllSchedulers } from './scheduler';

let schedulersInitialized = false;

/**
 * Inicializa todos los schedulers del sistema
 * Se ejecuta automáticamente una sola vez
 */
export function initializeSchedulers(): void {
  // Solo inicializar una vez
  if (schedulersInitialized) {
    console.log('ℹ️ Schedulers ya están inicializados');
    return;
  }

  // Solo inicializar en producción o cuando esté explícitamente habilitado
  const shouldInitialize = 
    process.env.NODE_ENV === 'production' || 
    process.env.ENABLE_SCHEDULERS === '1' ||
    process.env.RUN_SCHEDULERS === 'true';

  if (!shouldInitialize) {
    console.log('ℹ️ Schedulers deshabilitados en desarrollo. Para habilitar, usa ENABLE_SCHEDULERS=1');
    return;
  }

  try {
    console.log('🚀 Inicializando schedulers del sistema...');
    
    const success = startAllSchedulers();
    
    if (success) {
      schedulersInitialized = true;
      console.log('✅ Schedulers inicializados exitosamente');
    } else {
      console.error('❌ Error al inicializar algunos schedulers');
    }

    // Manejar cierre graceful de la aplicación
    process.on('SIGINT', handleGracefulShutdown);
    process.on('SIGTERM', handleGracefulShutdown);
    process.on('SIGUSR2', handleGracefulShutdown); // Para nodemon

  } catch (error) {
    console.error('💥 Error fatal inicializando schedulers:', error);
  }
}

/**
 * Maneja el cierre graceful de los schedulers
 */
function handleGracefulShutdown(signal: string): void {
  console.log(`\n⚠️ Señal ${signal} recibida, cerrando schedulers...`);
  
  try {
    const success = stopAllSchedulers();
    
    if (success) {
      console.log('✅ Schedulers cerrados exitosamente');
    } else {
      console.error('❌ Error cerrando algunos schedulers');
    }
    
    schedulersInitialized = false;
    
    // Permitir que el proceso termine naturalmente
    // No llamamos process.exit() aquí para permitir cleanup adicional
    
  } catch (error) {
    console.error('💥 Error cerrando schedulers:', error);
  }
}

/**
 * Verifica si los schedulers están inicializados
 */
export function areSchedulersInitialized(): boolean {
  return schedulersInitialized;
}

/**
 * Fuerza la detención de todos los schedulers
 */
export function forceStopSchedulers(): void {
  try {
    stopAllSchedulers();
    schedulersInitialized = false;
    console.log('🛑 Schedulers detenidos forzadamente');
  } catch (error) {
    console.error('❌ Error deteniendo schedulers forzadamente:', error);
  }
}

// Auto-inicialización si se está ejecutando en servidor
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Pequeño delay para permitir que la aplicación se inicialice completamente
  setTimeout(() => {
    initializeSchedulers();
  }, 2000);
}
