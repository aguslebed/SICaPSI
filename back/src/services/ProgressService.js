import mongoose from "mongoose";
import UserLevelProgress from "../models/UserLevelProgress.js";
import Level from "../models/Level.js";
import User from "../models/User.js";

const toObjectId = (id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);

class ProgressService {
 

  async getProgressByTraining(userId, trainingIds = []) {
    if (!Array.isArray(trainingIds) || trainingIds.length === 0) return {};

    const tIds = trainingIds.map(toObjectId);
    const uId = toObjectId(userId);

    // Totales de niveles por training
    const levelsAgg = await Level.aggregate([
      { $match: { trainingId: { $in: tIds } } },
      { $group: { _id: "$trainingId", totalLevels: { $sum: 1 } } }
    ]);

    const totalsMap = {};
    for (const row of levelsAgg) totalsMap[row._id.toString()] = row.totalLevels;

    // Niveles completados por usuario por training (filtrado al set dado)
    // Ahora contamos solo los niveles APROBADOS
    const completedAgg = await UserLevelProgress.aggregate([
      { $match: { userId: uId, completed: true, approved: true, trainingId: { $in: tIds } } },
      { $group: { _id: "$trainingId", levelsCompleted: { $sum: 1 } } }
    ]);

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
      // Contar niveles totales del curso
      const totalLevels = await Level.countDocuments({ trainingId: tId });

      // Contar usuarios anotados en la capacitación (no sólo los que tienen progreso)
      // Se consideran alumnos (role: "Alumno") cuya lista assignedTraining incluye el trainingId
      const totalUsers = await User.countDocuments({ role: "Alumno", assignedTraining: tId });

      // Agregación: contar niveles APROBADOS por cada usuario para este curso
      const perUserAgg = await UserLevelProgress.aggregate([
        { $match: { trainingId: tId, completed: true, approved: true } },
        { $group: { _id: "$userId", levelsCompleted: { $sum: 1 } } }
      ]);

      const totalLevelsCompleted = perUserAgg.reduce((sum, r) => sum + (r.levelsCompleted || 0), 0);

      // Promedio en porcentaje: promedio de (levelsCompleted / totalLevels) por usuario
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
      // Totales de niveles por training
      const levelsAgg = await Level.aggregate([
        { $group: { _id: "$trainingId", totalLevels: { $sum: 1 } } }
      ]);

      const totalsMap = {};
      for (const row of levelsAgg) totalsMap[String(row._id)] = row.totalLevels;

      // Agregación sobre UserLevelProgress: primero agrupar por training+user para contar niveles APROBADOS por usuario,
      // luego agrupar por training para obtener totalUsers y totalLevelsCompleted
      const perTrainingAgg = await UserLevelProgress.aggregate([
        { $match: { completed: true, approved: true } },
        { $group: { _id: { trainingId: "$trainingId", userId: "$userId" }, levelsCompleted: { $sum: 1 } } },
        { $group: { _id: "$_id.trainingId", totalUsers: { $sum: 1 }, totalLevelsCompleted: { $sum: "$levelsCompleted" } } }
      ]);

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
      // Contar niveles totales del curso
      const totalLevels = await Level.countDocuments({ trainingId: tId });

      // Contar niveles APROBADOS por el usuario en este curso
      const levelsCompleted = await UserLevelProgress.countDocuments({
        userId: uId,
        trainingId: tId,
        completed: true,
        approved: true
      });

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

    // Find the corresponding level in DB. Prefer level._id, otherwise use levelNumber + trainingId
    let dbLevel = null;
    try {
      if (level._id) {
        dbLevel = await Level.findById(toObjectId(level._id)).lean();
      }
      if (!dbLevel && (level.levelNumber || level.levelNumber === 0)) {
        dbLevel = await Level.findOne({ trainingId: tId, levelNumber: level.levelNumber }).lean();
      }
      // As a fallback, try to find by trainingId and title (best-effort)
      if (!dbLevel && level.title) {
        dbLevel = await Level.findOne({ trainingId: tId, title: level.title }).lean();
      }
    } catch (err) {
      // DB error -> not approved
      console.error('ProgressService.isLevelApproved: error fetching level', err);
      return { approved: false, earnedPoints: 0, totalPoints: 0, percentage: 0 };
    }

    if (!dbLevel) {
      // Can't compare without DB definition
      return { approved: false, earnedPoints: 0, totalPoints: 0, percentage: 0 };
    }

    const dbScenes = (dbLevel.test && Array.isArray(dbLevel.test.scenes)) ? dbLevel.test.scenes : [];

    // Compute total possible points for the level
    let totalPossible = 0;
    for (const scene of dbScenes) {
      // Saltar escenas finales (lastOne) en el cálculo de puntos totales
      if (scene.lastOne === true) {
        continue;
      }
      
      const opts = Array.isArray(scene.options) ? scene.options : [];
      // Tomar la opción con MÁS puntos (puede ser negativa si todas lo son)
      const maxOpt = opts.length > 0 ? Math.max(...opts.map(o => Number(o?.points ?? 0))) : 0;
      const bonus = Number(scene.bonus || 0);
      // Solo sumar si la mejor opción + bonus es positiva (mínimo 0 por escena)
      const sceneMax = Math.max(0, maxOpt + bonus);
      totalPossible += sceneMax;
    }

    // Extract user's scene results from the provided `level` object.
    // Accept several shapes: level.test.scenes, level.scenes, level.scenesResults, level.userAnswers
    const userScenes = level?.test?.scenes || level?.scenes || level?.scenesResults || level?.userAnswers || [];

    let earned = 0;

    if (Array.isArray(userScenes) && userScenes.length > 0) {
      for (const userScene of userScenes) {
        // Skip scoring if this scene is marked as the last one (lastOne or isLastOne)
        if (userScene.lastOne === true || userScene.isLastOne === true) {
          continue;
        }

        // Try to match the DB scene
        const sceneId = userScene.idScene ?? userScene.sceneId ?? userScene.id ?? null;
        let matchedDbScene = null;
        if (sceneId !== null && sceneId !== undefined) {
          matchedDbScene = dbScenes.find(s => s.idScene === Number(sceneId) || String(s.idScene) === String(sceneId));
        }
        // fallback: try matching by index or by provided _id
        if (!matchedDbScene && userScene._id) {
          matchedDbScene = dbScenes.find(s => String(s._id) === String(userScene._id));
        }
        if (!matchedDbScene) continue; // can't score this scene

        // If the user provided explicit points, use them
        if (typeof userScene.points === 'number') {
          earned += Number(userScene.points);
          continue;
        }

        // If user provided a selected option index
        if (typeof userScene.selectedOptionIndex === 'number') {
          const opt = matchedDbScene.options?.[userScene.selectedOptionIndex];
          if (opt && typeof opt.points === 'number') earned += Number(opt.points);
          continue;
        }

        // If user provided selectedOptionId
        if (userScene.selectedOptionId) {
          const opt = (matchedDbScene.options || []).find(o => String(o._id) === String(userScene.selectedOptionId));
          if (opt && typeof opt.points === 'number') earned += Number(opt.points);
          continue;
        }

        // If user provided selectedOption description/text
        if (userScene.selectedOptionDescription) {
          const opt = (matchedDbScene.options || []).find(o => (o.description || '') === userScene.selectedOptionDescription);
          if (opt && typeof opt.points === 'number') earned += Number(opt.points);
          continue;
        }

        // If user provided the whole selectedOption object
        if (userScene.selectedOption && typeof userScene.selectedOption.points === 'number') {
          earned += Number(userScene.selectedOption.points);
          console.log(earned,"--earned despues de sumar selectedOption.points---");
          continue;
        }

        // If none of the above, as a last resort try to match by 'next' value (rare)
        if (userScene.next != null && (matchedDbScene.options || []).length > 0) {
          const opt = (matchedDbScene.options || []).find(o => o.next === userScene.next || String(o.next) === String(userScene.next));
          if (opt && typeof opt.points === 'number') earned += Number(opt.points);
        }
      }
    }

    // Clamp earned to totalPossible
    if (earned > totalPossible) earned = totalPossible;

    const percentage = totalPossible > 0 ? (earned / totalPossible) * 100 : 0;
  // Determinar umbral de aprobación (por defecto 80%)
  const threshold = Number(passThreshold ?? 80);
  // Se considera un nivel aprobado si el porcentaje es mayor o igual al umbral
  const approved = percentage >= threshold;

    // Build a simplified list of selected options to store (avoid duplicating full level)
        const selectedOptions = [];
        if (Array.isArray(userScenes) && userScenes.length > 0) {
          for (const us of userScenes) {
            const sceneId = us.idScene ?? us.sceneId ?? us.id ?? null;
            const optionId = us.selectedOptionId ?? us.selectedOption?._id ?? us.selectedOption?.id ?? null;
            const description = us.selectedOptionDescription ?? us.selectedOption?.description ?? null;
            const pts = typeof us.points === 'number' ? us.points : (us.selectedOption && typeof us.selectedOption.points === 'number' ? us.selectedOption.points : null);
            if (sceneId !== null && (optionId !== null || description !== null)) {
              selectedOptions.push({ idScene: String(sceneId), optionId: optionId ? String(optionId) : undefined, description: description || undefined, points: pts });
            }
          }
        }


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

      // Buscar intentos previos del usuario para este nivel
      const existingAttempts = await UserLevelProgress.find({
        userId: uId,
        levelId: levelId
      }).sort({ percentage: -1, earnedPoints: -1 }).lean();

      // Determinar si este intento es mejor que los anteriores
      let shouldSave = true;
      
      if (existingAttempts.length > 0) {
        const bestAttempt = existingAttempts[0];
        
        // Comparar: 1) aprobación, 2) porcentaje, 3) puntos
        const currentIsBetter = 
          (approved && !bestAttempt.approved) || // Ahora aprobó y antes no
          (approved === bestAttempt.approved && percentage > bestAttempt.percentage) || // Mismo estado pero mejor %
          (approved === bestAttempt.approved && percentage === bestAttempt.percentage && earned > bestAttempt.earnedPoints); // Mismo % pero más puntos

        if (currentIsBetter) {
          console.log('✅ Nuevo intento ES MEJOR. Eliminando intentos anteriores...');
          
          // Eliminar TODOS los intentos previos
          await UserLevelProgress.deleteMany({
            userId: uId,
            levelId: levelId
          });
        } else {
          console.log('ℹ️ Nuevo intento NO es mejor. No se guardará.');
          shouldSave = false;
        }
      } else {
        console.log('✅ Primer intento del usuario en este nivel.');
      }

      // Guardar el intento si corresponde
      if (shouldSave) {
        await UserLevelProgress.create({
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
      // 1. Obtener el nivel desde DB para conocer estructura del test
      const level = await Level.findById(lId).lean();
      if (!level || level.trainingId.toString() !== tId.toString()) {
        throw new Error('Level not found or does not belong to this training');
      }

      const scenes = level?.test?.scenes || [];
      
      // Calcular puntaje máximo posible del nivel
      let maxPossibleScore = 0;
      for (const scene of scenes) {
        if (scene.lastOne === true) continue; // Saltar escenas finales
        const opts = Array.isArray(scene.options) ? scene.options : [];
        const maxOpt = opts.length > 0 ? Math.max(...opts.map(o => Number(o?.points ?? 0))) : 0;
        const bonus = Number(scene.bonus || 0);
        maxPossibleScore += Math.max(0, maxOpt + bonus);
      }

      // 2. Contar estudiantes inscritos en la capacitación
      const totalStudents = await User.countDocuments({ 
        role: "Alumno", 
        assignedTraining: tId 
      });

      // 3. Obtener registros de UserLevelProgress para este nivel
      const progressRecords = await UserLevelProgress.find({
        trainingId: tId,
        levelId: lId,
        completed: true
      }).lean();

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

      // 6. Obtener últimos intentos (últimos 10 registros ordenados por fecha)
      const recentAttempts = await UserLevelProgress.find({
        trainingId: tId,
        levelId: lId,
        completed: true
      })
        .sort({ completedAt: -1 })
        .limit(10)
        .populate('userId', 'firstName lastName email')
        .lean();

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

    

}
  

export default ProgressService;