import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";
import { resolveImageUrl, getMe } from "../../../API/Request";
import { normalizeRichTextValue, getPlainTextFromRichText } from "../../../Components/Modals/CreateTrainingModal/RichTextInput";

const TrainingIndex = () => {
  const { idTraining } = useParams();
  const { userData, setUserData } = useUser();
  if (!userData || !Array.isArray(userData.training)) {
    return <LoadingOverlay label="Cargando datos de capacitación..." />;
  }
  const training = userData.training.find(c => c._id === idTraining);
  if (!training) return <p className="text-center mt-20">Capacitación no encontrada</p>;

  const sanitizedDescription = normalizeRichTextValue(training.description || "");
  const hasDescription = getPlainTextFromRichText(sanitizedDescription).trim().length > 0;

 
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
              <div className="w-full bg-gray-200 h-6">
              <div
                className="bg-green-500 h-6 text-center text-sm font-semibold text-white"
                style={{ width: `${training.progressPercentage}%` }}
              >
                {training.progressPercentage}%
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
      </div>
    </>
  );
};

export default TrainingIndex;