import React from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";

const LevelTraining = () => {
  const { idTraining, nivelId } = useParams();
  const { userData } = useUser();

  if (!userData || !Array.isArray(userData.training))
    return <LoadingOverlay label="Cargando capacitación..." />;

  const curso = userData.training.find((c) => c._id === idTraining);
  if (!curso) return <div>No se encontró el curso.</div>;

  const nivel = Array.isArray(curso.levels)
    ? curso.levels.find((l) => l._id === nivelId)
    : null;
  if (!nivel) return <div>No se encontró el nivel.</div>;

  const training = nivel.training || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
        {/* Título */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-blue-700">
            {training.title || nivel.title}
          </h1>
          <p className="text-lg text-gray-600">{nivel.description}</p>
        </header>

        {/* Video */}
        {training.videoUrl && (
          <div className="rounded-xl overflow-hidden shadow-md flex justify-center">
            {/* Container keeps aspect ratio but caps to 1080x720 (3:2) and centers the video */}
            <div className="w-full bg-black max-w-[1080px] max-h-[720px] overflow-hidden flex items-center justify-center mx-auto">
                 <iframe
                  src={training.videoUrl}
                  title="Video de capacitación"
                   className="w-full h-full min-w-[280px] sm:min-w-[420px] md:min-w-[640px] min-h-[180px] sm:min-h-[240px] md:min-h-[360px] border-0"
                    frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
            </div>
          </div>
        )}

        {/* Descripción */}
        {training.description && (
          <section className="bg-blue-50 p-5 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-600 mb-2">
              Descripción de la capacitación
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {training.description}
            </p>
          </section>
        )}

        {/* Duración */}
        {training.duration && (
          <p className="text-sm text-blue-500 text-right">
            ⏱️ Duración: {training.duration} minutos
          </p>
        )}
      </div>
    </div>
  );
};

export default LevelTraining;
