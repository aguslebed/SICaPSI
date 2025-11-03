import React, { useEffect, useState } from 'react';
import { getTrainingProgress } from '../../API/Request';

const StudentProgressModal = ({ isOpen, onClose, student, trainingId }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !student || !trainingId) return;

    let mounted = true;

    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTrainingProgress(trainingId, student._id || student.id);
        console.log(data," --desde StudentProgressModal.jsx--")
        if (mounted) {
          // El backend devuelve { success: true, data: { ... } }
          // Extraer los datos correctamente
          setProgressData(data.data || data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Error al cargar progreso');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProgress();

    return () => {
      mounted = false;
    };
  }, [isOpen, student, trainingId]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Formatear fechas de forma consistente
  const formatDateTime = (value) => {
    if (!value) return '-';
    try {
      const d = new Date(value);
      return d.toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0077b6] text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold">Seguimiento del Alumno</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Datos del alumno */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Datos del Alumno</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Nombre:</span>
                <span className="ml-2 text-gray-800">
                  {student?.firstName || student?.first_name || ''} {student?.lastName || student?.last_name || ''}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-gray-800">{student?.email || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">DNI:</span>
                <span className="ml-2 text-gray-800">
                  {student?.documentNumber || student?.dni || student?.document_number || '-'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Último acceso:</span>
                <span className="ml-2 text-gray-800">{formatDateTime(student?.lastLogin || student?.last_login)}</span>
              </div>
            </div>
          </div>

          {/* Progreso de la capacitación */}
          {loading ? (
            <div className="py-8 text-center text-gray-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b6]"></div>
              <p className="mt-2">Cargando progreso...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="text-red-600 mb-2">⚠️ {error}</div>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-[#0077b6] hover:underline"
              >
                Reintentar
              </button>
            </div>
          ) : progressData ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Progreso por Nivel</h3>
              
              {/* Progreso general si existe */}
              {progressData.progressPercent !== undefined && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Progreso Total</span>
                    <span className="text-lg font-bold text-[#0077b6]">
                      {Math.round(progressData.progressPercent)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#0077b6] h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, progressData.progressPercent || 0)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {progressData.levelsCompleted || 0} de {progressData.totalLevels || 0} niveles completados
                  </div>
                </div>
              )}

              {/* Niveles */}
              {progressData.levels && progressData.levels.length > 0 ? (
                <div className="space-y-4">
                  {progressData.levels.map((level, idx) => (
                    <div
                      key={level._id || level.levelId || idx}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {level.levelName || level.name || `Nivel ${idx + 1}`}
                          </h4>
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`px-2 py-1 rounded ${
                              level.approved || level.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {level.approved || level.isApproved ? '✓ Aprobado' : '⏳ En progreso'}
                            </span>
                            {level.score !== undefined && (
                              <span className="text-gray-600">
                                Puntaje: <span className="font-medium">{level.score}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        {level.completionPercentage !== undefined && (
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-[#0077b6]">
                              {Math.round(level.completionPercentage)}%
                            </div>
                            <div className="text-xs text-gray-500">Completado</div>
                          </div>
                        )}
                      </div>

                      {/* Barra de progreso del nivel */}
                      {level.completionPercentage !== undefined && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              level.approved || level.isApproved ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, level.completionPercentage || 0)}%` }}
                          />
                        </div>
                      )}

                      {/* Información adicional */}
                      {level.lastAttempt && (
                        <div className="text-xs text-gray-500 mt-2">
                          Último intento: {formatDateTime(level.lastAttempt)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                 
                  {progressData.progressPercent !== undefined && (
                    <p className="text-sm">Progreso general: {Math.round(progressData.progressPercent)}%</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No se encontró información de progreso.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProgressModal;
