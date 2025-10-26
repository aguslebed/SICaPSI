/**
 * ScoreCalculator - Funciones puras para calcular puntajes de niveles
 * Cumple con SRP: única responsabilidad es calcular scores sin tocar BD
 */

/**
 * Calcula el puntaje máximo posible de un nivel
 * @param {Array} scenes - Array de escenas del nivel
 * @returns {number} Puntaje total máximo alcanzable
 */
export function calculateMaxPossibleScore(scenes = []) {
  let totalPossible = 0;

  for (const scene of scenes) {
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

  return totalPossible;
}

/**
 * Calcula los puntos ganados por el usuario basándose en las escenas del nivel
 * @param {Array} dbScenes - Escenas del nivel desde la base de datos
 * @param {Array} userScenes - Escenas con las respuestas del usuario
 * @returns {Object} { earnedPoints, selectedOptions }
 */
export function calculateUserScore(dbScenes = [], userScenes = []) {
  let earned = 0;
  const selectedOptions = [];

  if (!Array.isArray(userScenes) || userScenes.length === 0) {
    return { earnedPoints: earned, selectedOptions };
  }

  for (const userScene of userScenes) {
    // Skip scoring if this scene is marked as the last one
    if (userScene.lastOne === true || userScene.isLastOne === true) {
      continue;
    }

    // Try to match the DB scene
    const sceneId = userScene.idScene ?? userScene.sceneId ?? userScene.id ?? null;
    let matchedDbScene = null;
    
    if (sceneId !== null && sceneId !== undefined) {
      matchedDbScene = dbScenes.find(s => 
        s.idScene === Number(sceneId) || String(s.idScene) === String(sceneId)
      );
    }
    
    // fallback: try matching by _id
    if (!matchedDbScene && userScene._id) {
      matchedDbScene = dbScenes.find(s => String(s._id) === String(userScene._id));
    }
    
    if (!matchedDbScene) continue; // can't score this scene

    let scenePoints = 0;
    let optionId = null;
    let description = null;

    // If the user provided explicit points, use them
    if (typeof userScene.points === 'number') {
      scenePoints = Number(userScene.points);
    }
    // If user provided a selected option index
    else if (typeof userScene.selectedOptionIndex === 'number') {
      const opt = matchedDbScene.options?.[userScene.selectedOptionIndex];
      if (opt && typeof opt.points === 'number') {
        scenePoints = Number(opt.points);
        optionId = opt._id;
        description = opt.description;
      }
    }
    // If user provided selectedOptionId
    else if (userScene.selectedOptionId) {
      const opt = (matchedDbScene.options || []).find(o => 
        String(o._id) === String(userScene.selectedOptionId)
      );
      if (opt && typeof opt.points === 'number') {
        scenePoints = Number(opt.points);
        optionId = opt._id;
        description = opt.description;
      }
    }
    // If user provided selectedOption description/text
    else if (userScene.selectedOptionDescription) {
      const opt = (matchedDbScene.options || []).find(o => 
        (o.description || '') === userScene.selectedOptionDescription
      );
      if (opt && typeof opt.points === 'number') {
        scenePoints = Number(opt.points);
        optionId = opt._id;
        description = opt.description;
      }
    }
    // If user provided the whole selectedOption object
    else if (userScene.selectedOption && typeof userScene.selectedOption.points === 'number') {
      scenePoints = Number(userScene.selectedOption.points);
      optionId = userScene.selectedOption._id || userScene.selectedOption.id;
      description = userScene.selectedOption.description;
    }
    // Last resort: match by 'next' value
    else if (userScene.next != null && (matchedDbScene.options || []).length > 0) {
      const opt = (matchedDbScene.options || []).find(o => 
        o.next === userScene.next || String(o.next) === String(userScene.next)
      );
      if (opt && typeof opt.points === 'number') {
        scenePoints = Number(opt.points);
        optionId = opt._id;
        description = opt.description;
      }
    }

    earned += scenePoints;

    // Build selectedOptions entry
    const finalOptionId = optionId ?? userScene.selectedOptionId ?? userScene.selectedOption?._id ?? null;
    const finalDescription = description ?? userScene.selectedOptionDescription ?? userScene.selectedOption?.description ?? null;
    
    if (sceneId !== null && (finalOptionId !== null || finalDescription !== null)) {
      selectedOptions.push({
        idScene: String(sceneId),
        optionId: finalOptionId ? String(finalOptionId) : undefined,
        description: finalDescription || undefined,
        points: scenePoints
      });
    }
  }

  return { earnedPoints: earned, selectedOptions };
}

/**
 * Determina si un nivel está aprobado basándose en el porcentaje obtenido
 * @param {number} earnedPoints - Puntos obtenidos por el usuario
 * @param {number} totalPoints - Puntos totales posibles
 * @param {number} passThreshold - Umbral de aprobación (por defecto 80)
 * @returns {Object} { approved, percentage }
 */
export function isApproved(earnedPoints, totalPoints, passThreshold = 80) {
  // Clamp earned to totalPossible
  const clampedEarned = Math.min(earnedPoints, totalPoints);
  const percentage = totalPoints > 0 ? (clampedEarned / totalPoints) * 100 : 0;
  const threshold = Number(passThreshold ?? 80);
  const approved = percentage >= threshold;

  return { approved, percentage };
}

/**
 * Compara dos intentos de un nivel y determina cuál es mejor
 * Criterio: 1) aprobación, 2) porcentaje, 3) puntos
 * @param {Object} attempt1 - { approved, percentage, earnedPoints }
 * @param {Object} attempt2 - { approved, percentage, earnedPoints }
 * @returns {number} -1 si attempt1 es mejor, 1 si attempt2 es mejor, 0 si son iguales
 */
export function compareAttempts(attempt1, attempt2) {
  // Comparar aprobación
  if (attempt1.approved && !attempt2.approved) return -1;
  if (!attempt1.approved && attempt2.approved) return 1;

  // Comparar porcentaje
  if (attempt1.percentage > attempt2.percentage) return -1;
  if (attempt1.percentage < attempt2.percentage) return 1;

  // Comparar puntos
  if (attempt1.earnedPoints > attempt2.earnedPoints) return -1;
  if (attempt1.earnedPoints < attempt2.earnedPoints) return 1;

  return 0; // Son iguales
}
