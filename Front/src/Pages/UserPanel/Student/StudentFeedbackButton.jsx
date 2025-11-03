import React, { useState, useMemo } from 'react';
import { submitTrainingFeedback } from '../../../API/Request';
import { useUser } from '../../../context/UserContext';
import TrainingFeedbackModal from '../../../Components/Modals/TrainingFeedbackModal';
import SuccessModal from '../../../Components/Modals/SuccessModal';

export default function StudentFeedbackButton({ trainingId, training }) {
  const { userData } = useUser();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const effectiveTrainingId = trainingId || training?._id;
  const effectiveTraining = useMemo(() => {
    if (training) return training;
    if (!effectiveTrainingId) return null;
    return userData?.training?.find((c) => c._id === effectiveTrainingId) || null;
  }, [training, effectiveTrainingId, userData?.training]);

  const isAlumno = userData?.user?.role === 'Alumno';

  if (!isAlumno || !effectiveTrainingId || !effectiveTraining) {
    return null;
  }

  const handleFeedbackSubmit = async (feedbackText) => {
    try {
      await submitTrainingFeedback(effectiveTrainingId, feedbackText);
      setShowFeedbackModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al enviar retroalimentación:', error);
      alert('Error al enviar la retroalimentación. Por favor, intenta nuevamente.');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-2"
          title="Enviar retroalimentación"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </button>
      </div>

      <TrainingFeedbackModal
        open={showFeedbackModal}
        training={effectiveTraining}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
      />
      <SuccessModal
        open={showSuccessModal}
        title="¡Retroalimentación Enviada!"
        message="Gracias por compartir tu experiencia."
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
}
