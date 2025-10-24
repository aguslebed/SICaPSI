// Interface para el servicio de progreso / aprobaciones de niveles
export class IProgressService {
  // Devuelve progreso agregado para múltiples trainings
  // userId: string|ObjectId
  // trainingIds: array|string[] - ids de trainings
  async getProgressByTraining(userId, trainingIds = []) { throw new Error('Not implemented'); }

  // Devuelve progreso para un solo training
  // Retorna { totalLevels, levelsCompleted, progressPercent }
  async getProgressForSingleTraining(userId, trainingId) { throw new Error('Not implemented'); }

  // Evalúa si un nivel está aprobado dado el objeto level (con resultados del usuario)
  // Retorna { approved, earnedPoints, totalPoints, percentage, selectedOptions }
  async isLevelApproved(userId, trainingId, level) { throw new Error('Not implemented'); }
}