import React from "react";
import CapacitacionCard from "../../../Components/Student/TrainingCard";
import WelcomeModal from "../../../Components/Modals/WelcomeModal";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay"; 

// Panel principal de usuario
const UserPanel = () => {
  const { userData } = useUser();
 
  console.log(userData," --desde userPanel.jsx--")
  // Si los datos aún no están cargados
  if (!userData) {
    return <div className="min-h-[50vh] flex items-center justify-center"><LoadingOverlay label="Cargando datos de usuario..." /></div>;
  }

  // training del usuario
  const training = userData?.training || [];

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