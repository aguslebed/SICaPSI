/**
 * PathFinder - Algoritmo puro para encontrar el camino óptimo en un grafo de decisiones
 * Cumple con SRP: única responsabilidad es recorrer el grafo y calcular el camino óptimo
 */

/**
 * Encuentra el camino óptimo (máximo puntaje) recorriendo el grafo de decisiones
 * @param {Array} scenes - Array de escenas del nivel
 * @returns {Object} { optimalPath, totalMaxScore, visitedScenes, unvisitedScenes }
 */
export function findOptimalPath(scenes = []) {
  if (scenes.length === 0) {
    return {
      optimalPath: [],
      totalMaxScore: 0,
      totalScenes: 0,
      visitedScenes: 0,
      unvisitedScenes: 0,
      message: 'No hay escenas definidas'
    };
  }

  // Crear mapa de escenas por idScene para acceso rápido
  const sceneMap = {};
  for (const scene of scenes) {
    sceneMap[scene.idScene] = scene;
  }

  // Encontrar la primera escena (idScene === 1 o la primera en el array)
  let currentSceneId = 1;
  let currentScene = sceneMap[currentSceneId];
  
  if (!currentScene) {
    // Si no hay escena con idScene=1, tomar la primera del array
    currentScene = scenes[0];
    currentSceneId = currentScene.idScene;
  }

  const optimalPath = [];
  const visitedScenes = new Set(); // Para detectar ciclos infinitos
  let totalMaxScore = 0;

  // Recorrer el grafo siguiendo las mejores decisiones
  while (currentScene && !visitedScenes.has(currentSceneId)) {
    visitedScenes.add(currentSceneId);

    // Si es escena final, agregarla y terminar
    if (currentScene.lastOne === true) {
      optimalPath.push({
        sceneId: currentScene.idScene,
        sceneDescription: currentScene.description,
        isLastScene: true,
        bestOption: null,
        maxPoints: 0,
        bonus: 0,
        totalPoints: 0,
        nextScene: null,
        message: 'Escena final (no suma puntos)'
      });
      break;
    }

    const opts = Array.isArray(currentScene.options) ? currentScene.options : [];
    const bonus = Number(currentScene.bonus || 0);

    if (opts.length === 0) {
      // Escena sin opciones: solo cuenta bonus y termina
      optimalPath.push({
        sceneId: currentScene.idScene,
        sceneDescription: currentScene.description,
        isLastScene: false,
        bestOption: null,
        maxPoints: 0,
        bonus: bonus,
        totalPoints: Math.max(0, bonus),
        nextScene: null,
        message: 'Sin opciones disponibles - fin del camino'
      });
      totalMaxScore += Math.max(0, bonus);
      break;
    }

    // Encontrar la opción con más puntos
    let bestOption = null;
    let maxOptionPoints = -Infinity;

    for (const option of opts) {
      const points = Number(option?.points ?? 0);
      if (points > maxOptionPoints) {
        maxOptionPoints = points;
        bestOption = option;
      }
    }

    // Calcular puntos totales de esta escena
    const sceneTotalPoints = Math.max(0, maxOptionPoints + bonus);
    totalMaxScore += sceneTotalPoints;

    // Determinar siguiente escena
    const nextSceneId = bestOption?.next || null;

    optimalPath.push({
      sceneId: currentScene.idScene,
      sceneDescription: currentScene.description,
      isLastScene: false,
      bestOption: {
        id: bestOption?._id,
        description: bestOption?.description || 'Sin descripción',
        points: maxOptionPoints,
        next: nextSceneId
      },
      maxPoints: maxOptionPoints,
      bonus: bonus,
      totalPoints: sceneTotalPoints,
      nextScene: nextSceneId,
      alternativeOptions: opts
        .filter(o => o !== bestOption)
        .map(o => ({
          id: o._id,
          description: o.description || 'Sin descripción',
          points: Number(o?.points ?? 0),
          next: o.next,
          leadsTo: o.next ? `Escena ${o.next}` : 'Fin'
        }))
        .sort((a, b) => b.points - a.points)
    });

    // Avanzar a la siguiente escena
    if (nextSceneId === null || nextSceneId === undefined) {
      // No hay siguiente escena, fin del camino
      break;
    }

    currentSceneId = nextSceneId;
    currentScene = sceneMap[currentSceneId];

    if (!currentScene) {
      // La escena referenciada no existe
      console.warn(`Escena ${currentSceneId} referenciada pero no encontrada en el nivel`);
      break;
    }
  }

  // Detectar si hubo un ciclo
  if (visitedScenes.has(currentSceneId) && currentScene && !currentScene.lastOne) {
    console.warn('Se detectó un ciclo infinito en el nivel');
  }

  return {
    optimalPath: optimalPath,
    totalMaxScore: totalMaxScore,
    totalScenes: scenes.length,
    visitedScenes: optimalPath.length,
    unvisitedScenes: scenes.length - optimalPath.length,
    message: `Camino óptimo calculado: ${totalMaxScore} puntos máximos en ${optimalPath.length} escenas visitadas`
  };
}
