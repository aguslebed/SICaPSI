import React from "react";
import WelcomeModal from "../../../Components/Student/WelcomeModal";
import CapacitacionCard from "../../../Components/Student/TrainingCard";
import Navbar from "../../../Components/Student/NavBar";
import { useUser } from "../../../Context/UserContext";

// Panel principal de usuario
const UserPanel = () => {
  const { userData } = useUser();

  // Si los datos aún no están cargados
  if (!userData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Cargando datos de usuario...</h2>
            <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  // training del usuario
  const training = userData.data?.training || [];

  // Renderizar solo los datos requeridos
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto">
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