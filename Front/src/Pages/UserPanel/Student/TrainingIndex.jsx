import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";
import { resolveImageUrl, getMe, getTrainingProgress, submitTrainingFeedback } from "../../../API/Request";
import { normalizeRichTextValue, getPlainTextFromRichText } from "../../../Components/Modals/CreateTrainingModal/RichTextInput";
import TrainingFeedbackModal from "../../../Components/Modals/TrainingFeedbackModal";
import SuccessModal from "../../../Components/Modals/SuccessModal";

const TrainingIndex = () => {
  const { idTraining } = useParams();
  const { userData, setUserData } = useUser();
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const loadTrainingProgress = async () => {
      if (!userData || !idTraining) {
        setLoading(false);
        return;
      }

      const userId = userData?.user?._id || userData?._id;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const progressResponse = await getTrainingProgress(idTraining, userId);
        const progressData = progressResponse.data || progressResponse;
        setTrainingProgress(progressData.progressPercent || 0);
      } catch (error) {
        console.error(`Error obteniendo progreso del curso ${idTraining}:`, error);
        setTrainingProgress(0);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingProgress();
  }, [idTraining, userData]);

  if (!userData || !Array.isArray(userData.training) || loading) {
    return <LoadingOverlay label="Cargando datos de capacitación..." />;
  }
  
  const training = userData.training.find(c => c._id === idTraining);
  if (!training) return <p className="text-center mt-20">Capacitación no encontrada</p>;

  const sanitizedDescription = normalizeRichTextValue(training.description || "");
  const hasDescription = getPlainTextFromRichText(sanitizedDescription).trim().length > 0;

  const handleFeedbackSubmit = async (feedback) => {
    try {
      await submitTrainingFeedback(idTraining, feedback);
      setShowFeedbackModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al enviar retroalimentación:', error);
      alert('Error al enviar la retroalimentación. Por favor, intenta nuevamente.');
    }
  };

  return (
    <>
      <div className="">
        <div className="">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Imagen y título */}
            <div
              className="h-48 bg-black bg-center bg-cover flex flex-col justify-center text-white px-8"
              style={{ backgroundImage: `url(${resolveImageUrl(training.image)})` }}
            >
              <h1 className="text-3xl font-bold break-words" dangerouslySetInnerHTML={{ __html: normalizeRichTextValue(training.title) || 'Sin título' }} />
              <p className="text-lg break-words" dangerouslySetInnerHTML={{ __html: normalizeRichTextValue(training.subtitle) || 'Sin subtítulo' }} />
            </div>
            {/* Barra de progress */}
            {userData.user.role === "Alumno" && (
              <div className="w-full bg-gray-200 h-6 relative">
                <div className="absolute w-full h-6 text-center text-sm font-semibold text-gray-700 flex items-center justify-center">
                  {trainingProgress}%
                </div>
                <div
                  className="bg-green-500 h-6 text-center text-sm font-semibold text-white flex items-center justify-center"
                  style={{ width: `${trainingProgress}%` }}
                >
                </div>
              </div>
            )}
            
            {/* Descripción */}
            <div className="p-6">
              <h2 className="font-semibold mb-2">Descripción de la capacitación</h2>
              {hasDescription ? (
                <div
                  className="text-gray-700 leading-relaxed break-words"
                  dir="ltr"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              ) : (
                <p className="text-gray-500 italic">Sin descripción</p>
              )}
            </div>
          </div>
        </div>

        {/* Botón de retroalimentación - discreto en la esquina inferior derecha */}
        {userData.user.role === "Alumno" && (
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
        )}
      </div>

      {/* Modals */}
      <TrainingFeedbackModal
        open={showFeedbackModal}
        training={training}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
      />
      <SuccessModal
        open={showSuccessModal}
        title="¡Retroalimentación Enviada!"
        message="Gracias por compartir tu experiencia. Tu retroalimentación es muy valiosa para nosotros."
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default TrainingIndex;