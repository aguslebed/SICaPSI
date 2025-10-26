import mongoose from "mongoose";
import LevelRepository from "../repositories/LevelRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import ProgressRepository from "../repositories/ProgressRepository.js";
import { calculateMaxPossibleScore, calculateUserScore, isApproved, compareAttempts } from "../utils/ScoreCalculator.js";
import { findOptimalPath } from "../utils/PathFinder.js";

const toObjectId = (id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);

class ProgressService {
  /**
   * Constructor con inyección de dependencias (DIP)
   * @param {Object} dependencies - Dependencias opcionales para testing
   */
  constructor(dependencies = {}) {
    this.levelRepo = dependencies.levelRepo || new LevelRepository();
    this.userRepo = dependencies.userRepo || new UserRepository();
    this.progressRepo = dependencies.progressRepo || new ProgressRepository();
  }
 

  async getProgressByTraining(userId, trainingIds = []) {
    if (!Array.isArray(trainingIds) || trainingIds.length === 0) return {};

    const tIds = trainingIds.map(toObjectId);
    const uId = toObjectId(userId);

    // Totales de niveles por training (usando repositorio)
    const levelsAgg = await this.levelRepo.aggregateTotalsByTrainings(tIds);

    const totalsMap = {};
    for (const row of levelsAgg) totalsMap[row._id.toString()] = row.totalLevels;

    // Niveles completados por usuario por training (usando repositorio)
    const completedAgg = await this.progressRepo.aggregateCompletedByUserAndTrainings(uId, tIds);

    const completedMap = {};
    for (const row of completedAgg) completedMap[row._id.toString()] = row.levelsCompleted;

    const result = {};
    for (const tId of tIds) {
      const key = tId.toString();
      const total = totalsMap[key] || 0;
      const done = completedMap[key] || 0;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      result[key] = { totalLevels: total, levelsCompleted: done, progressPercent: pct };
    }
    return result;
  }


  async totalTrainingProgress(trainingId){
    if (!trainingId) return { totalLevels: 0, totalUsers: 0, totalLevelsCompleted: 0, averagePercent: 0 };

    const tId = toObjectId(trainingId);

    try {
      // Contar niveles totales del curso (usando repositorio)
      const totalLevels = await this.levelRepo.countByTrainingId(tId);

      // Contar usuarios anotados en la capacitación (usando repositorio)
      const totalUsers = await this.userRepo.countStudentsByTraining(tId);

      // Agregación: contar niveles APROBADOS por cada usuario (usando repositorio)
      const perUserAgg = await this.progressRepo.aggregateCompletedByTraining(tId);

      const totalLevelsCompleted = perUserAgg.reduce((sum, r) => sum + (r.levelsCompleted || 0), 0);

      // Promedio en porcentaje
      const averagePercent = (totalUsers > 0 && totalLevels > 0)
        ? Math.round((totalLevelsCompleted / (totalUsers * totalLevels)) * 100)
        : 0;

      return {
        totalLevels,
        totalUsers,
        totalLevelsCompleted,
        averagePercent
      };
    } catch (err) {
      console.error('ProgressService.totalTrainingProgress: error', err);
      return { totalLevels: 0, totalUsers: 0, totalLevelsCompleted: 0, averagePercent: 0 };
    }
  }

  /**
   * Devuelve un arreglo con el resumen de progreso para todas las capacitaciones.
   * Cada elemento tiene la forma: { trainingId, totalLevels, totalUsers, totalLevelsCompleted, averagePercent }
   */
  async allTrainingsProgress() {
    try {
      // Totales de niveles por training (usando repositorio)
      const levelsAgg = await this.levelRepo.aggregateTotalsByTraining();

      const totalsMap = {};
      for (const row of levelsAgg) totalsMap[String(row._id)] = row.totalLevels;

      // Agregación sobre UserLevelProgress (usando repositorio)
      const perTrainingAgg = await this.progressRepo.aggregateGlobalProgress();

      const perTrainMap = {};
      for (const r of perTrainingAgg) {
        perTrainMap[String(r._id)] = { totalUsers: r.totalUsers || 0, totalLevelsCompleted: r.totalLevelsCompleted || 0 };
      }

      // Combine keys (trainings present in levelsAgg or perTrainingAgg)
      const keys = new Set([...Object.keys(totalsMap), ...Object.keys(perTrainMap)]);
      const result = [];

      for (const k of keys) {
        const totalLevels = totalsMap[k] || 0;
        const totalUsers = perTrainMap[k]?.totalUsers || 0;
        const totalLevelsCompleted = perTrainMap[k]?.totalLevelsCompleted || 0;
        const averagePercent = (totalUsers > 0 && totalLevels > 0)
          ? Math.round((totalLevelsCompleted / (totalUsers * totalLevels)) * 100)
          : 0;

        result.push({ trainingId: k, totalLevels, totalUsers, totalLevelsCompleted, averagePercent });
      }

      return result;
    } catch (err) {
      console.error('ProgressService.allTrainingsProgress: error', err);
      return [];
    }
  }

  /**
   * Obtiene el progreso de un usuario en un curso específico
   * @param {string|ObjectId} userId - ID del usuario
   * @param {string|ObjectId} trainingId - ID del curso
   * @returns {Object} { totalLevels, levelsCompleted, progressPercent }
   */
  async getProgressForSingleTraining(userId, trainingId) {
    if (!userId || !trainingId) {
      return { totalLevels: 0, levelsCompleted: 0, progressPercent: 0 };
    }

    const tId = toObjectId(trainingId);
    const uId = toObjectId(userId);

    try {
      // Contar niveles totales del curso (usando repositorio)
      const totalLevels = await this.levelRepo.countByTrainingId(tId);

      // Contar niveles APROBADOS por el usuario (usando repositorio)
      const levelsCompleted = await this.progressRepo.countCompletedAndApproved(uId, tId);

      // Calcular porcentaje
      const progressPercent = totalLevels > 0 ? Math.round((levelsCompleted / totalLevels) * 100) : 0;

      return {
        totalLevels,
        levelsCompleted,
        progressPercent
      };
    } catch (err) {
      console.error('ProgressService.getProgressForSingleTraining: error', err);
      return { totalLevels: 0, levelsCompleted: 0, progressPercent: 0 };
    }
  }

  /**
   * Evalúa si un nivel está aprobado según las respuestas del usuario.
   * @param {string|ObjectId} userId
   * @param {string|ObjectId} trainingId
   * @param {Object} level - objeto level que incluye las respuestas del usuario
   * @param {number} passThreshold - porcentaje mínimo para aprobar (por defecto 80)
   */
  async isLevelApproved(userId, trainingId, level, passThreshold = 80) {
    // Validate inputs
    if (!userId || !trainingId || !level) {
      return { approved: false, earnedPoints: 0, totalPoints: 0, percentage: 0 };
    }

    // Resolve training and user ids
    const tId = toObjectId(trainingId);
    const uId = toObjectId(userId);

    // Find the corresponding level in DB (usando repositorio)
    let dbLevel = null;
    try {
      if (level._id) {
        dbLevel = await this.levelRepo.findById(toObjectId(level._id));
      }
      if (!dbLevel && (level.levelNumber || level.levelNumber === 0)) {
        dbLevel = await this.levelRepo.findByTrainingAndNumber(tId, level.levelNumber);
      }
      if (!dbLevel && level.title) {
        dbLevel = await this.levelRepo.findByTrainingAndTitle(tId, level.title);
      }
    } catch (err) {
      console.error('ProgressService.isLevelApproved: error fetching level', err);
      return { approved: false, earnedPoints: 0, totalPoints: 0, percentage: 0 };
    }

    if (!dbLevel) {
      return { approved: false, earnedPoints: 0, totalPoints: 0, percentage: 0 };
    }

    const dbScenes = (dbLevel.test && Array.isArray(dbLevel.test.scenes)) ? dbLevel.test.scenes : [];

    // Calcular total posible usando ScoreCalculator
    const totalPossible = calculateMaxPossibleScore(dbScenes);

    // Extract user's scene results
    const userScenes = level?.test?.scenes || level?.scenes || level?.scenesResults || level?.userAnswers || [];

    // Calcular puntos ganados usando ScoreCalculator
    const { earnedPoints: earned, selectedOptions } = calculateUserScore(dbScenes, userScenes);

    // Determinar aprobación usando ScoreCalculator
    const { approved, percentage } = isApproved(earned, totalPossible, passThreshold);

    const result = { approved, earnedPoints: earned, totalPoints: totalPossible, percentage, selectedOptions };

    // SIEMPRE guardar el intento (aprobado o desaprobado)
    try {
      const levelId = dbLevel._id;
      
      console.log('🔍 Guardando intento en UserLevelProgress:', {
        userId: uId,
        trainingId: tId,
        levelId: levelId,
        approved,
        earnedPoints: earned,
        percentage: Math.round(percentage * 100) / 100
      });

      // Buscar intentos previos (usando repositorio)
      const existingAttempts = await this.progressRepo.findByUserAndLevel(uId, levelId);

      // Determinar si este intento es mejor que los anteriores (usando ScoreCalculator)
      let shouldSave = true;
      
      if (existingAttempts.length > 0) {
        const bestAttempt = existingAttempts[0];
        
        const currentAttempt = { approved, percentage, earnedPoints: earned };
        const previousAttempt = { 
          approved: bestAttempt.approved, 
          percentage: bestAttempt.percentage, 
          earnedPoints: bestAttempt.earnedPoints 
        };

        const comparison = compareAttempts(currentAttempt, previousAttempt);
        const currentIsBetter = comparison < 0;

        if (currentIsBetter) {
          console.log('✅ Nuevo intento ES MEJOR. Eliminando intentos anteriores...');
          
          // Eliminar TODOS los intentos previos (usando repositorio)
          await this.progressRepo.deleteByUserAndLevel(uId, levelId);
        } else {
          console.log('ℹ️ Nuevo intento NO es mejor. No se guardará.');
          shouldSave = false;
        }
      } else {
        console.log('✅ Primer intento del usuario en este nivel.');
      }

      // Guardar el intento si corresponde (usando repositorio)
      if (shouldSave) {
        await this.progressRepo.create({
          userId: uId,
          trainingId: tId,
          levelId: levelId,
          status: approved ? 'completed' : 'failed',
          completed: true,
          approved: approved,
          completedAt: new Date(),
          earnedPoints: earned,
          totalPoints: totalPossible,
          percentage: Math.round(percentage * 100) / 100,
          selectedOptions: selectedOptions
        });

        console.log('✅ Intento guardado exitosamente.');
      }
      
    } catch (err) {
      console.error('❌ ProgressService.isLevelApproved: error guardando intento', err);
    }

    return result;
  }

  /**
   * Obtiene estadísticas detalladas de un nivel específico en una capacitación.
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @param {string|ObjectId} levelId - ID del nivel
   * @returns {Object} Estadísticas del nivel (aprobados, promedio puntos, opciones más seleccionadas, etc.)
   */
  async getLevelStatistics(trainingId, levelId) {
    if (!trainingId || !levelId) {
      return {
        levelId: null,
        totalStudents: 0,
        studentsCompleted: 0,
        studentsApproved: 0,
        approvalRate: 0,
        averageScore: 0,
        averagePercentage: 0,
        maxScore: 0,
        minScore: 0,
        scenesStatistics: [],
        lastAttempts: []
      };
    }

    const tId = toObjectId(trainingId);
    const lId = toObjectId(levelId);

    try {
      // 1. Obtener el nivel desde DB (usando repositorio)
      const level = await this.levelRepo.findById(lId);
      if (!level || level.trainingId.toString() !== tId.toString()) {
        throw new Error('Level not found or does not belong to this training');
      }

      const scenes = level?.test?.scenes || [];
      
      // Calcular puntaje máximo posible del nivel (usando ScoreCalculator)
      const maxPossibleScore = calculateMaxPossibleScore(scenes);

      // 2. Contar estudiantes inscritos (usando repositorio)
      const totalStudents = await this.userRepo.countStudentsByTraining(tId);

      // 3. Obtener registros de UserLevelProgress (usando repositorio)
      const progressRecords = await this.progressRepo.findCompletedByTrainingAndLevel(tId, lId);

      const studentsCompleted = progressRecords.length;

      // 4. Calcular estadísticas de puntos (usando selectedOptions)
      const scores = [];
      const sceneSelections = {}; // { idScene: { optionId: count } }

      for (const record of progressRecords) {
        let totalPoints = 0;
        const selectedOptions = record.selectedOptions || [];

        // Sumar puntos de las opciones seleccionadas
        for (const selected of selectedOptions) {
          const points = Number(selected.points || 0);
          totalPoints += points;

          // Contar selecciones por escena y opción
          const sceneId = String(selected.idScene);
          if (!sceneSelections[sceneId]) {
            sceneSelections[sceneId] = {};
          }
          const optKey = selected.optionId || selected.description || 'unknown';
          sceneSelections[sceneId][optKey] = (sceneSelections[sceneId][optKey] || 0) + 1;
        }

        scores.push(totalPoints);
      }

      // Calcular métricas de puntajes
      const averageScore = scores.length > 0 
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;
      
      const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
      const minScore = scores.length > 0 ? Math.min(...scores) : 0;
      
      const averagePercentage = maxPossibleScore > 0 
        ? Math.round((averageScore / maxPossibleScore) * 100)
        : 0;

      // Calcular aprobados usando el campo 'approved' del modelo
      const studentsApproved = progressRecords.filter(r => r.approved === true).length;
      const approvalRate = studentsCompleted > 0 
        ? Math.round((studentsApproved / studentsCompleted) * 100)
        : 0;

      // 5. Construir estadísticas por escena
      const scenesStatistics = scenes
        .filter(scene => scene.lastOne !== true) // Excluir escenas finales
        .map(scene => {
          const sceneId = String(scene.idScene);
          const selections = sceneSelections[sceneId] || {};
          
          // Ordenar opciones por cantidad de selecciones
          const optionStats = Object.entries(selections)
            .map(([key, count]) => {
              // Intentar encontrar la descripción de la opción
              const option = scene.options?.find(o => 
                String(o._id) === key || o.description === key
              );
              return {
                optionKey: key,
                description: option?.description || key,
                points: option?.points || 0,
                timesSelected: count,
                percentage: studentsCompleted > 0 
                  ? Math.round((count / studentsCompleted) * 100)
                  : 0
              };
            })
            .sort((a, b) => b.timesSelected - a.timesSelected);

          return {
            idScene: scene.idScene,
            description: scene.description,
            totalResponses: studentsCompleted,
            optionsStatistics: optionStats
          };
        });

      // 6. Obtener últimos intentos (usando repositorio)
      const recentAttempts = await this.progressRepo.findRecentCompletedWithUser(tId, lId, 10);

      const lastAttempts = recentAttempts.map(record => {
        // Usar los campos ya calculados del modelo
        const totalPoints = record.earnedPoints || 0;
        const percentage = record.percentage || 0;
        const approved = record.approved || false;

        return {
          userId: record.userId?._id,
          userName: `${record.userId?.firstName || ''} ${record.userId?.lastName || ''}`.trim() || 'Usuario desconocido',
          email: record.userId?.email,
          completedAt: record.completedAt,
          score: totalPoints,
          percentage,
          approved
        };
      });

      return {
        levelId: lId,
        levelNumber: level.levelNumber,
        levelTitle: level.title,
        totalStudents,
        studentsCompleted,
        studentsApproved,
        completionRate: totalStudents > 0 ? Math.round((studentsCompleted / totalStudents) * 100) : 0,
        approvalRate,
        averageScore,
        averagePercentage,
        maxPossibleScore,
        maxScore,
        minScore,
        scenesStatistics,
        lastAttempts
      };

    } catch (err) {
      console.error('ProgressService.getLevelStatistics: error', err);
      return {
        levelId: null,
        error: err.message,
        totalStudents: 0,
        studentsCompleted: 0,
        studentsApproved: 0,
        approvalRate: 0,
        averageScore: 0,
        averagePercentage: 0,
        maxScore: 0,
        minScore: 0,
        scenesStatistics: [],
        lastAttempts: []
      };
    }
  }

  /**
   * Obtiene estadísticas detalladas de un usuario en una capacitación específica, nivel por nivel
   * @param {string|ObjectId} userId - ID del usuario
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Object} Estadísticas completas del usuario con desglose por nivel
   */
  async getUserTrainingStatistics(userId, trainingId) {
    if (!userId || !trainingId) {
      return {
        user: null,
        training: null,
        levelStatistics: [],
        error: 'userId y trainingId son requeridos'
      };
    }

    const uId = toObjectId(userId);
    const tId = toObjectId(trainingId);

    try {
      // 1. Obtener datos del usuario (usando repositorio)
      const user = await this.userRepo.findById(
        uId, 
        'firstName lastName email documentType documentNumber birthDate phone role'
      );

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // 2. Obtener datos de la capacitación y sus niveles (usando repositorio)
      const levels = await this.levelRepo.findByTrainingId(tId);

      if (levels.length === 0) {
        return {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            documentType: user.documentType,
            documentNumber: user.documentNumber,
            birthDate: user.birthDate,
            phone: user.phone,
            role: user.role
          },
          training: { id: tId },
          levelStatistics: [],
          summary: {
            totalLevels: 0,
            levelsAttempted: 0,
            levelsApproved: 0,
            averageScore: 0,
            averagePercentage: 0
          }
        };
      }

      // 3. Obtener registros de progreso del usuario (usando repositorio)
      const progressRecords = await this.progressRepo.findByUserAndTraining(uId, tId);

      // Crear mapa de progreso por nivel
      const progressMap = {};
      for (const record of progressRecords) {
        progressMap[record.levelId.toString()] = record;
      }

      // 4. Construir estadísticas por nivel
      const levelStatistics = [];
      let totalScore = 0;
      let totalPossible = 0;
      let levelsAttempted = 0;
      let levelsApproved = 0;

      for (const level of levels) {
        const levelId = level._id.toString();
        const progressRecord = progressMap[levelId];

        // Calcular puntaje máximo posible del nivel (usando ScoreCalculator)
        const scenes = level?.test?.scenes || [];
        const maxPossibleScore = calculateMaxPossibleScore(scenes);

        if (progressRecord) {
          // El usuario intentó este nivel
          levelsAttempted++;
          if (progressRecord.approved) {
            levelsApproved++;
          }

          const earnedPoints = progressRecord.earnedPoints || 0;
          const percentage = progressRecord.percentage || 0;
          totalScore += earnedPoints;
          totalPossible += maxPossibleScore;

          // Analizar decisiones tomadas (selectedOptions)
          const decisions = [];
          const selectedOptions = progressRecord.selectedOptions || [];
          let correctDecisions = 0;
          let incorrectDecisions = 0;

          for (const selected of selectedOptions) {
            const sceneId = selected.idScene;
            const scene = scenes.find(s => String(s.idScene) === String(sceneId));
            
            if (scene) {
              const selectedOption = scene.options?.find(o => 
                String(o._id) === String(selected.optionId) || 
                o.description === selected.description
              );

              const points = selected.points || 0;
              const isCorrect = points > 0;
              
              if (isCorrect) {
                correctDecisions++;
              } else {
                incorrectDecisions++;
              }

              decisions.push({
                sceneId: sceneId,
                sceneDescription: scene.description,
                selectedOption: selected.description || selectedOption?.description || 'Desconocida',
                points: points,
                isCorrect: isCorrect,
                maxPossiblePoints: scene.options ? Math.max(...scene.options.map(o => Number(o?.points ?? 0))) : 0
              });
            }
          }

          levelStatistics.push({
            levelId: level._id,
            levelNumber: level.levelNumber,
            levelTitle: level.title,
            attempted: true,
            approved: progressRecord.approved,
            status: progressRecord.status,
            completedAt: progressRecord.completedAt,
            score: {
              earned: earnedPoints,
              total: maxPossibleScore,
              percentage: percentage
            },
            errors: {
              total: incorrectDecisions,
              correct: correctDecisions,
              totalDecisions: decisions.length
            },
            decisions: decisions
          });
        } else {
          // El usuario no intentó este nivel
          levelStatistics.push({
            levelId: level._id,
            levelNumber: level.levelNumber,
            levelTitle: level.title,
            attempted: false,
            approved: false,
            status: 'not_attempted',
            completedAt: null,
            score: {
              earned: 0,
              total: maxPossibleScore,
              percentage: 0
            },
            errors: {
              total: 0,
              correct: 0,
              totalDecisions: 0
            },
            decisions: []
          });
          totalPossible += maxPossibleScore;
        }
      }

      // 5. Calcular resumen general
      const averageScore = levelsAttempted > 0 
        ? Math.round((totalScore / levelsAttempted) * 10) / 10
        : 0;

      const averagePercentage = totalPossible > 0
        ? Math.round((totalScore / totalPossible) * 100)
        : 0;

      return {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          documentType: user.documentType,
          documentNumber: user.documentNumber,
          birthDate: user.birthDate,
          phone: user.phone,
          role: user.role
        },
        training: {
          id: tId
        },
        levelStatistics: levelStatistics,
        summary: {
          totalLevels: levels.length,
          levelsAttempted: levelsAttempted,
          levelsApproved: levelsApproved,
          levelsPending: levels.length - levelsAttempted,
          averageScore: averageScore,
          averagePercentage: averagePercentage,
          totalScore: totalScore,
          totalPossibleScore: totalPossible
        }
      };

    } catch (err) {
      console.error('ProgressService.getUserTrainingStatistics: error', err);
      return {
        user: null,
        training: null,
        levelStatistics: [],
        summary: null,
        error: err.message
      };
    }
  }

  /**
   * Calcula el camino óptimo (máximo puntaje) para un nivel específico.
   * Recorre el grafo de decisiones siguiendo el campo 'next' de las opciones.
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @param {string|ObjectId} levelId - ID del nivel
   * @returns {Object} Camino óptimo con las mejores decisiones por escena (solo escenas visitadas)
   */
  async getOptimalPath(trainingId, levelId) {
    if (!trainingId || !levelId) {
      return {
        levelId: null,
        optimalPath: [],
        totalMaxScore: 0,
        error: 'trainingId y levelId son requeridos'
      };
    }

    const tId = toObjectId(trainingId);
    const lId = toObjectId(levelId);

    try {
      // Obtener el nivel desde DB (usando repositorio)
      const level = await this.levelRepo.findById(lId);
      
      if (!level || level.trainingId.toString() !== tId.toString()) {
        throw new Error('Level not found or does not belong to this training');
      }

      const scenes = level?.test?.scenes || [];

      // Usar PathFinder para calcular el camino óptimo (función pura)
      const pathResult = findOptimalPath(scenes);

      return {
        levelId: lId,
        levelNumber: level.levelNumber,
        levelTitle: level.title,
        trainingId: tId,
        ...pathResult
      };

    } catch (err) {
      console.error('ProgressService.getOptimalPath: error', err);
      return {
        levelId: null,
        optimalPath: [],
        totalMaxScore: 0,
        error: err.message
      };
    }
  }

    

}
  

export default ProgressService;