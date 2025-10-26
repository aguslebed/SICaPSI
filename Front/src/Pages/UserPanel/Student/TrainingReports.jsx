import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { getUserTrainingStatistics, getOptimalPath } from "../../../API/Request";
import { X, CheckCircle2, XCircle, TrendingUp, Award } from "lucide-react";

const TrainingReports = () => {
  const [caminoModal, setCaminoModal] = useState(null); // { levelStats, optimalPath, levelName }
  const [loadingPath, setLoadingPath] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const { userData } = useUser();
  const { idTraining } = useParams();
  const userId = userData?.user?._id;

  // Cargar estadísticas del usuario
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId || !idTraining) return;
      
      setLoadingStats(true);
      try {
        const response = await getUserTrainingStatistics(userId, idTraining);
        if (response.success) {
          setUserStats(response.data);
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [userId, idTraining]);

  // Abrir modal con comparación de caminos
  const handleVerCamino = async (levelStats) => {
    setLoadingPath(true);
    try {
      const response = await getOptimalPath(idTraining, levelStats.levelId);
      if (response.success) {
        setCaminoModal({
          levelStats,
          optimalPath: response.data,
          levelName: levelStats.levelName || `Nivel ${levelStats.levelNumber}`
        });
      }
    } catch (error) {
      console.error("Error al cargar camino óptimo:", error);
      alert("Error al cargar el camino óptimo");
    } finally {
      setLoadingPath(false);
    }
  };

  const cerrarModal = () => {
    setCaminoModal(null);
  };

  if (loadingStats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando reportes...</div>
      </div>
    );
  }

  const levelStats = userStats?.levelStatistics || [];
  
  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-screen-xl w-full mx-auto flex px-4 sm:px-6 md:px-8">

          {/* Contenido principal */}
          <main className="flex-1 min-w-0 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
            Mis reportes
          </h1>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-[#0077b6] text-white">
                  <th className="py-3 px-4 text-center">Nivel</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Puntaje</th>
                  <th className="py-3 px-4 text-center">Errores</th>
                  <th className="py-3 px-4 text-center">Decisiones</th>
                  <th className="py-3 px-4 text-center">Camino</th>
                </tr>
              </thead>
              <tbody>
                {levelStats.length === 0 ? (
                  <tr><td colSpan={6} className="py-4 text-center text-gray-500">No hay reportes para esta capacitación.</td></tr>
                ) : (
                  levelStats.map((level, idx) => (
                    <tr key={level.levelId || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                      <td className="py-2 px-4 text-center font-medium">{level.levelName || `Nivel ${level.levelNumber}`}</td>
                      <td className="py-2 px-4 text-center">
                        {level.attempted ? (
                          level.approved ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 size={16} />
                              Aprobado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle size={16} />
                              Desaprobado
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">No intentado</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {level.attempted ? `${level.score.earned} / ${level.score.total}` : "-"}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {level.attempted ? level.errors.total : "-"}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {level.attempted ? level.errors.totalDecisions : "-"}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {level.attempted ? (
                          <button
                            onClick={() => handleVerCamino(level)}
                            disabled={loadingPath}
                            className="text-[#0077b6] underline hover:text-[#005a8c] disabled:opacity-50"
                          >
                            Ver camino
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal de comparación de caminos */}
          {caminoModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">
                    Comparación de Caminos - {caminoModal.levelName}
                  </h2>
                  <button
                    onClick={cerrarModal}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Resumen de desempeño */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Tu Puntaje</div>
                      <div className="text-2xl font-bold text-[#0077b6]">
                        {caminoModal.levelStats.score.earned} / {caminoModal.levelStats.score.total}
                      </div>
                      <div className="text-sm text-gray-600">
                        {caminoModal.levelStats.score.percentage.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Puntaje Óptimo</div>
                      <div className="text-2xl font-bold text-green-600">
                        {caminoModal.optimalPath.totalMaxScore}
                      </div>
                      <div className="text-sm text-gray-600">
                        {caminoModal.optimalPath.visitedScenes} escenas
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Errores</div>
                      <div className="text-2xl font-bold text-red-600">
                        {caminoModal.levelStats.errors.total}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Eficiencia</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {caminoModal.optimalPath.totalMaxScore > 0 
                          ? ((caminoModal.levelStats.score.earned / caminoModal.optimalPath.totalMaxScore) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido del modal: Dos columnas */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Columna izquierda: Tu camino */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="text-[#0077b6]" size={20} />
                        Tu Camino
                      </h3>
                      <div className="space-y-3">
                        {caminoModal.levelStats.decisions?.map((decision, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-medium text-gray-700">
                                Escena {decision.sceneId}
                              </span>
                              <span className={`font-bold ${decision.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {decision.points > 0 ? '+' : ''}{decision.points} pts
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {decision.sceneDescription}
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              → {decision.selectedOption}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Columna derecha: Camino óptimo */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="text-green-600" size={20} />
                        Camino Óptimo
                      </h3>
                      <div className="space-y-3">
                        {caminoModal.optimalPath.optimalPath
                          ?.filter(step => step.totalPoints > 0 || !step.isLastScene)
                          ?.map((step, idx) => (
                          <div key={idx} className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-medium text-gray-700">
                                Escena {step.sceneId}
                              </span>
                              <span className="font-bold text-green-600">
                                +{step.totalPoints} pts
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {step.sceneDescription}
                            </p>
                            {step.bestOption && (
                              <p className="text-sm font-medium text-gray-800">
                                → {step.bestOption.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
                  <button
                    onClick={cerrarModal}
                    className="px-6 py-2 bg-[#0077b6] text-white rounded-md hover:bg-[#005a8c] transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
          </main>
        </div>
      </div>
    </>
  );
};

export default TrainingReports;

