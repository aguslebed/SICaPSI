// utils/trainingScheduler.js
//
// Scheduler responsable de mantener el estado de las capacitaciones coherente
// respecto a sus fechas. Importante: NO auto-habilita capacitaciones.
//
// Comportamiento:
// - Se ejecuta al iniciar la aplicación y luego una vez al día (medianoche).
// - Deshabilita (`isActive = false`) las capacitaciones activas cuya
//   `endDate` ya pasó (evita que cursos vencidos permanezcan activos).
// - NO cambia `isActive` a `true` en ningún caso. La habilitación debe
//   realizarla manualmente un usuario con rol Directivo (flujo de aprobación).
//
// Funciones exportadas:
// - updateTrainingsActiveStatus(): realiza la comprobación y actualiza los
//   documentos necesarios. Retorna un objeto { success: boolean, updated: number }.
// - startTrainingScheduler(): programa la ejecución diaria del updater.
//
// Notas de implementación:
// - Solo consulta capacitaciones con `isActive: true` y `endDate` definido,
//   para minimizar escrituras.
// - El scheduler no usa `console.log` para evitar ruido en producción.

import Training from '../models/Training.js';

/**
 * Actualiza las capacitaciones activas que hayan vencido, marcándolas como
 * inactivas. Retorna { success, updated }.
 */
export async function updateTrainingsActiveStatus() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // El scheduler únicamente DESHABILITA capacitaciones cuya fecha de fin ya pasó
    // para evitar que cursos vencidos permanezcan activos.
    const trainings = await Training.find({ endDate: { $ne: null }, isActive: true });

    let updated = 0;

    for (const training of trainings) {
      const endDate = new Date(training.endDate);
      endDate.setHours(0, 0, 0, 0);

      // Si la fecha de fin ya pasó, deshabilitar y limpiar pendingApproval
      if (endDate < today) {
        training.isActive = false;
        training.pendingApproval = false; // Marca como finalizada (no pendiente)
        await training.save();
        updated++;
      }
    }

    return { success: true, updated };
  } catch (error) {
    console.error('Error actualizando estado de capacitaciones:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Inicia el scheduler que ejecuta la actualización cada día a medianoche.
 * Ejecuta `updateTrainingsActiveStatus` inmediatamente al llamar.
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
}
