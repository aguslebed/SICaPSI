import React, { useEffect, useState } from 'react';
import { getAllFeedback, getAllTrainings } from '../../API/Request';
import NavBar from '../../Components/Student/NavBar';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';
import FeedbackMessageModal from '../../Components/Modals/FeedbackMessageModal';
import { getPlainTextFromRichText } from '../../Components/Modals/CreateTrainingModal/RichTextInput';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    loadFeedbacks();
    loadTrainings();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await getAllFeedback();
      setFeedbacks(response.feedbacks || []);
    } catch (error) {
      console.error('Error cargando retroalimentación:', error);
      alert('Error al cargar la retroalimentación');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainings = async () => {
    try {
      const response = await getAllTrainings();
      const trainingsList = Array.isArray(response) ? response : (response?.items || []);
      // Filtrar solo cursos activos (no eliminados, activos y no pendientes de aprobación)
      const activeTrainings = trainingsList.filter(training => 
        training.isActive && !training.isDeleted && !training.pendingApproval
      );
      setTrainings(activeTrainings);
    } catch (error) {
      console.error('Error cargando capacitaciones:', error);
    }
  };

  const handleViewMessage = (feedback) => {
    setSelectedFeedback(feedback);
    setShowMessageModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtml = (value) =>
    typeof value === 'string' ? value.replace(/<[^>]+>/g, '').trim() : value ?? '';

  // Filtrar feedbacks por curso seleccionado
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (selectedCourse === 'all') return true;
    const trainingTitle = feedback.training?.title 
      ? stripHtml(feedback.training.title)
      : '';
    return trainingTitle === selectedCourse;
  });

  if (loading) {
    return <LoadingOverlay label="Cargando retroalimentación..." />;
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Retroalimentación de Cursos</h1>
            <p className="text-gray-600 mt-2">
              Visualiza la retroalimentación enviada por los alumnos sobre las capacitaciones
            </p>
          </div>

          {/* Filtro por curso */}
          <div className="mb-4 bg-white rounded-lg shadow p-4">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label className="text-sm font-medium text-gray-700">Filtrar por curso:</label>
              <select 
                value={selectedCourse} 
                onChange={e => setSelectedCourse(e.target.value)}
                className="admin-filter-input"
                style={{ minWidth: '250px' }}
              >
                <option value="all">Todos los cursos</option>
                {trainings.map(training => (
                  <option key={training._id} value={stripHtml(training.title)}>
                    {stripHtml(training.title)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No hay retroalimentación disponible</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacitación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alumno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profesor Asignado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mensaje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFeedbacks.map((feedback) => {
                      const trainingTitle = feedback.training?.title 
                        ? getPlainTextFromRichText(feedback.training.title)
                        : 'Sin título';
                      
                      return (
                        <tr key={feedback._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {trainingTitle}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {feedback.user?.firstName && feedback.user?.lastName 
                                ? `${feedback.user.firstName} ${feedback.user.lastName}` 
                                : 'Usuario desconocido'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {feedback.user?.email || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(feedback.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {feedback.training?.teacherName || feedback.training?.assignedTeacher || 'No asignado'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleViewMessage(feedback)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
                            >
                              Ver Mensaje
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <FeedbackMessageModal
        open={showMessageModal}
        feedback={selectedFeedback}
        onClose={() => {
          setShowMessageModal(false);
          setSelectedFeedback(null);
        }}
      />
    </>
  );
}
