import React from 'react';
import ModalWrapper from './ModalWrapper';
import { getPlainTextFromRichText } from './CreateTrainingModal/RichTextInput';

export default function FeedbackMessageModal({ open, feedback, onClose }) {
  if (!open || !feedback) return null;

  const trainingTitle = feedback.training?.title 
    ? getPlainTextFromRichText(feedback.training.title)
    : 'Sin título';

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ModalWrapper onClose={onClose} panelClassName="w-[92vw] sm:w-auto max-w-[700px]">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Retroalimentación del Alumno
        </h2>

        <div className="space-y-4">
          {/* Información del curso */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              {trainingTitle}
            </h3>
            {(feedback.training?.teacherName || feedback.training?.assignedTeacher) && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Profesor:</span> {feedback.training.teacherName || feedback.training.assignedTeacher}
              </p>
            )}
          </div>

          {/* Información del alumno */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Alumno:</span> {feedback.user?.firstName && feedback.user?.lastName 
                ? `${feedback.user.firstName} ${feedback.user.lastName}` 
                : 'Usuario desconocido'}
            </p>
            {feedback.user?.email && (
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Email:</span> {feedback.user.email}
              </p>
            )}
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Fecha:</span> {formatDate(feedback.createdAt)}
            </p>
          </div>

          {/* Mensaje de retroalimentación */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Mensaje:</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[120px]">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {feedback.feedback}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
