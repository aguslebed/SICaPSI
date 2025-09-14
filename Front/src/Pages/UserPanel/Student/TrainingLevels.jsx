import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, CheckCircle, Lock, BookOpen, PlayCircle } from "lucide-react";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";

const TrainingLevels = () => {
  const [openLevel, setOpenLevel] = useState(null);
  const { idTraining, nivelId } = useParams();
  const { userData } = useUser();
  const navigate = useNavigate();
 

  if (!userData || !Array.isArray(userData.training)) {
    return (
      <>
        <LoadingOverlay label="Cargando datos de curso..." />
      </>
    );
  }
  const curso = userData.training.find(c => c._id === idTraining);
  const niveles = curso?.levels || [];

  const toggleNivel = (nivelId) => {
    if (openLevel === nivelId) {
      setOpenLevel(null);
    } else {
      setOpenLevel(nivelId);
    }
  };

  const Linkbibliografia = (nivelId) => {
    navigate(`/userPanel/${idTraining}/${nivelId}/bibliogrhapy`); 
  };
  const LinkCapacitacion = (nivelId) => {
    navigate(`/userPanel/${idTraining}/${nivelId}/training`);
  };
  const LinkEvaluacion = (nivelId) => {
    navigate(`/userPanel/${idTraining}/${nivelId}/levelTest`);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-screen-xl w-full mx-auto flex px-4 sm:px-6 md:px-8">
          <main className="flex-1 min-w-0 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Niveles</h1>
          <div className="space-y-4">
            {niveles.map((nivel) => (
              <div key={nivel._id} className="border rounded-lg bg-white shadow">
                {/* Encabezado nivel */}
                <div
                  className={`flex justify-between items-center px-6 py-3 cursor-pointer transition ${nivel.isActive ? "bg-blue-100" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  onClick={() => nivel.isActive && toggleNivel(nivel._id)}
                >
                  <span className="font-semibold">{nivel.title}</span>
                  <div className="flex items-center gap-2">
                    {/* Aquí podrías mostrar si el nivel está completado usando progreso */}
                    <ChevronDown
                      className={`w-5 h-5 transform transition-transform ${openLevel === nivel._id ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
                {/* Contenido desplegable */}
                {openLevel === nivel._id && nivel.isActive && (
                  <div className="px-6 py-4 space-y-3 bg-blue-50">
                    <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-200 hover:bg-blue-300 transition hover:cursor-pointer"
                      onClick={() => Linkbibliografia(nivel._id)}>
                      <BookOpen className="w-5 h-5" />
                      Bibliografía
                    </button>
                    <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-200 hover:bg-blue-300 transition hover:cursor-pointer"
                      onClick={() => LinkCapacitacion(nivel._id)}>
                      <PlayCircle className="w-5 h-5" />
                      Capacitación
                    </button>
                    <button className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition hover:cursor-pointer"
                      onClick={() => LinkEvaluacion(nivel._id)}>
                      Iniciar evaluación del {nivel.title}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default TrainingLevels;
