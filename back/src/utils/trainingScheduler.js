// utils/trainingScheduler.js
import Training from '../models/Training.js';

/**
 * Actualiza el estado isActive de todas las capacitaciones según sus fechas
 * Se ejecuta automáticamente cada día a medianoche
 */
export async function updateTrainingsActiveStatus() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`[${new Date().toISOString()}] Actualizando estado de capacitaciones...`);
    
    // Obtener todas las capacitaciones que tienen fechas definidas
    const trainings = await Training.find({
      startDate: { $ne: null },
      endDate: { $ne: null }
    });
    
    let updated = 0;
    
    for (const training of trainings) {
      const startDate = new Date(training.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(training.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      let shouldBeActive = false;
      
      // Si estamos dentro del rango de fechas, debe estar activa
      if (today >= startDate && today <= endDate) {
        shouldBeActive = true;
      }
      
      // Si el estado cambió, actualizar
      if (training.isActive !== shouldBeActive) {
        training.isActive = shouldBeActive;
        await training.save();
        updated++;
        console.log(`  - Capacitación "${training.title}" ${shouldBeActive ? 'habilitada' : 'deshabilitada'} automáticamente`);
      }
    }
    
    console.log(`[${new Date().toISOString()}] Actualización completada. ${updated} capacitaciones actualizadas.`);
    
    return { success: true, updated };
  } catch (error) {
    console.error('Error actualizando estado de capacitaciones:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Inicia el scheduler que ejecuta la actualización cada día a medianoche
 */
export function startTrainingScheduler() {
  // Ejecutar inmediatamente al iniciar
  updateTrainingsActiveStatus();
  
  // Calcular tiempo hasta la próxima medianoche
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = nextMidnight.getTime() - now.getTime();
  
  // Programar primera ejecución a medianoche
  setTimeout(() => {
    updateTrainingsActiveStatus();
    
    // Luego ejecutar cada 24 horas
    setInterval(updateTrainingsActiveStatus, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  
  console.log(`[${new Date().toISOString()}] Scheduler de capacitaciones iniciado. Próxima ejecución: ${nextMidnight.toISOString()}`);
}
