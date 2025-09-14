
import React from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";

const LevelTraining = () => {
  const { idTraining, nivelId } = useParams();
  const { userData } = useUser();

  if (!userData || !Array.isArray(userData.training)) return <LoadingOverlay label="Cargando capacitación..." />;

  const curso = userData.training.find(c => c._id === idTraining);
  if (!curso) return <div>No se encontró el curso.</div>;

  const nivel = Array.isArray(curso.levels) ? curso.levels.find(l => l._id === nivelId) : null;
  if (!nivel) return <div>No se encontró el nivel.</div>;

  const training = nivel.training || {};

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-screen-xl w-full mx-auto flex px-4 sm:px-6 md:px-8">
          <main className="flex-1 min-w-0 py-6 md:py-8">
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 rounded-2xl shadow-xl border border-blue-200 max-w-3xl mx-auto flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">{nivel.title}</h1>
            <h2 className="text-lg text-gray-600 mb-4">{nivel.description}</h2>
            {/* Video */}
            {training.videoUrl && (
              <div className="rounded-lg overflow-hidden shadow-md mb-6 flex justify-center">
                <iframe
                  src={training.videoUrl}
                  title="Video de capacitación"
                  className="w-full h-72 max-w-2xl border-2 border-blue-200 rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            {/* Descripción */}
            {training.description && (
              <div className="bg-blue-50 p-4 rounded-xl shadow">
                <h3 className="font-semibold text-blue-600 mb-2">Descripción de la capacitación</h3>
                <p className="text-gray-700 text-base">{training.description}</p>
              </div>
            )}
            {/* Duración */}
            {training.duration && (
              <div className="text-sm text-blue-500 mt-2">Duración: {training.duration} minutos</div>
            )}
          </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default LevelTraining;