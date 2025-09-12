import React from "react";
import CapacitacionCard from "../../../Components/Student/TrainingCard";
import Navbar from "../../../Components/Student/NavBar";
import { useUser } from "../../../Context/UserContext";
import LoadingOverlay from "../../../Components/Shared/LoadingOverlay";
import WelcomeModal from "../../../Components/Modals/WelcomeModal";

// Panel principal de usuario
const UserPanel = () => {
  const { userData } = useUser();

  // Si los datos aún no están cargados
  if (!userData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <LoadingOverlay label="Cargando datos de usuario..." />
        </div>
      </>
    );
  }

  // training del usuario
  const training = userData?.training || [];

  // Renderizar solo los datos requeridos
  return (
    <>
      <Navbar />
      <WelcomeModal />
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Encabezado */}
          <div className="text-left mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Capacitaciones
            </h1>
            <p className="text-gray-600 text-lg">
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
                  porcentaje={Training.progressPercentage} // Si tienes el progreso, puedes calcularlo aquí
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