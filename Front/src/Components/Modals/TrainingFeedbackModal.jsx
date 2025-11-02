import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import { getPlainTextFromRichText } from './CreateTrainingModal/RichTextInput';

export default function TrainingFeedbackModal({ open, training, onClose, onSubmit }) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !training) return null;

  // Extract plain text from HTML title
  const plainTitle = getPlainTextFromRichText(training.title || 'Sin título');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Error enviando retroalimentación:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No especificada';
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <ModalWrapper onClose={onClose} panelClassName="w-[92vw] sm:w-auto max-w-[600px]">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Retroalimentación del Curso
        </h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">
            {plainTitle}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            {training.startDate && (
              <p>
                <span className="font-medium">Inicio:</span> {formatDate(training.startDate)}
              </p>
            )}
            {training.endDate && (
              <p>
                <span className="font-medium">Fin:</span> {formatDate(training.endDate)}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="feedback" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tu retroalimentación
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Comparti tu experiencia con este curso..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Retroalimentación'}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
