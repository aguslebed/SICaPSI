import React, { useEffect, useState } from "react";
import CapacitacionCard from "../../../Components/Student/TrainingCard";
import WelcomeModal from "../../../Components/Modals/WelcomeModal";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";
import { getTrainingProgress } from "../../../API/Request"; 

// Panel principal de usuario
const UserPanel = () => {
  const { userData } = useUser();
  const [trainingsWithProgress, setTrainingsWithProgress] = useState([]);
  const [loading, setLoading] = useState(true);
 
  console.log(userData," --desde userPanel.jsx--")

  // Cargar progreso de cada capacitación
  useEffect(() => {
    const loadTrainingProgress = async () => {
      if (!userData || !userData.training) {
        setLoading(false);
        return;
      }

      const userId = userData?.user?._id || userData?._id;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const trainingsWithProgressData = await Promise.all(
          userData.training.map(async (training) => {
            try {
              const progressResponse = await getTrainingProgress(training._id, userId);
              const progressData = progressResponse.data || progressResponse;
              return {
                ...training,
                progressPercent: progressData.progressPercent || 0
              };
            } catch (error) {
              console.error(`Error obteniendo progreso de ${training._id}:`, error);
              return {
                ...training,
                progressPercent: 0
              };
            }
          })
        );
        
        setTrainingsWithProgress(trainingsWithProgressData);
      } catch (error) {
        console.error('Error general cargando progresos:', error);
        setTrainingsWithProgress(userData.training || []);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingProgress();
  }, [userData]);

  // Si los datos aún no están cargados
  if (!userData || loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><LoadingOverlay label="Cargando datos de usuario..." /></div>;
  }

  // training del usuario con progreso actualizado
  const training = trainingsWithProgress;

  // Renderizar solo los datos requeridos
  return (
    <>
      <WelcomeModal />
      <div className="">
        <div className="">
          {/* Encabezado */}
          <div className="text-left mb-6 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Capacitaciones
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Selecciona una capacitación para continuar tu entrenamiento
            </p>
          </div>

          {/* Grid de capacitaciones */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {training.length > 0 ? (
              training.map((Training) => (
                <CapacitacionCard
                  key={Training._id}
                  titulo={Training.title}
                  subtitulo={Training.subtitle}
                  porcentaje={Training.progressPercent} // Si tienes el progreso, puedes calcularlo aquí
                  estado={Training.isActive ? "activo" : "desactivado"}
                  link={`/userPanel/${Training._id}`}
                  imagen={Training.image}
                />
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500">No tienes training asignados.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPanel; 